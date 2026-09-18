"""Tests for LupaTherm preview: static site + /api/lead node function."""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://lupatherm-preview-1.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---------------- Static site + headers ----------------
class TestHomepage:
    def test_home_200_and_content(self, s):
        r = s.get(BASE_URL + "/", timeout=15)
        assert r.status_code == 200, r.text[:200]
        assert "text/html" in r.headers.get("Content-Type", "")
        # Hero text (Hungarian, no accents)
        body = r.text
        assert "LupaTherm" in body or "lupatherm" in body.lower()
        # loose check for hero phrase (accents may vary)
        assert re.search(r"Ny[ií]l[aá]sz[aá]r[oó]", body), "Hero heading missing"

    def test_home_security_headers(self, s):
        r = s.get(BASE_URL + "/", timeout=15)
        h = {k.lower(): v for k, v in r.headers.items()}
        csp = h.get("content-security-policy", "")
        assert csp, "CSP missing"
        assert "frame-ancestors 'self' https:" in csp, f"frame-ancestors relax missing: {csp}"
        assert "strict-transport-security" in h
        assert h.get("x-content-type-options", "").lower() == "nosniff"
        assert "strict-origin-when-cross-origin" in h.get("referrer-policy", "").lower()
        assert "permissions-policy" in h
        # X-Frame-Options must be absent on preview host
        assert "x-frame-options" not in h, f"X-Frame-Options should be absent on preview: {h.get('x-frame-options')}"


class TestStaticAssets:
    def test_css(self, s):
        r = s.get(BASE_URL + "/assets/css/styles.css", timeout=15)
        assert r.status_code == 200
        assert "text/css" in r.headers.get("Content-Type", "")

    def test_hero_image(self, s):
        # Try hero.jpg then og.jpg
        for path in ["/assets/img/hero.jpg", "/assets/img/og.jpg"]:
            r = s.get(BASE_URL + path, timeout=15)
            if r.status_code == 200:
                assert r.headers.get("Content-Type", "").startswith("image/")
                return
        pytest.fail("Neither hero.jpg nor og.jpg returned 200")

    def test_robots(self, s):
        r = s.get(BASE_URL + "/robots.txt", timeout=15)
        assert r.status_code == 200
        assert "text/plain" in r.headers.get("Content-Type", "")

    def test_sitemap(self, s):
        r = s.get(BASE_URL + "/sitemap.xml", timeout=15)
        assert r.status_code == 200
        ct = r.headers.get("Content-Type", "")
        assert "xml" in ct

    def test_404(self, s):
        r = s.get(BASE_URL + "/nincs-ilyen-oldal", timeout=15)
        assert r.status_code == 404
        assert "text/html" in r.headers.get("Content-Type", "")
        assert len(r.text) > 100  # 404.html body served


# ---------------- /api/lead node function ----------------
class TestApiLead:
    URL = None

    @classmethod
    def setup_class(cls):
        cls.URL = BASE_URL + "/api/lead"

    def test_get_method_not_allowed(self, s):
        r = s.get(self.URL, timeout=15)
        assert r.status_code == 405, f"expected 405, got {r.status_code}: {r.text[:200]}"

    def test_post_invalid_json_missing_name(self, s):
        payload = {"telefon": "+36301234567", "helyszin": "Budapest", "hozzajarulas": "igen"}
        r = s.post(self.URL, json=payload, timeout=20)
        assert r.status_code == 422, f"got {r.status_code}: {r.text[:300]}"
        # Hungarian validation message expected
        assert r.text  # non-empty

    def test_post_valid_json_returns_500_no_email_env(self, s):
        payload = {
            "nev": "Teszt Elek",
            "telefon": "+36301234567",
            "helyszin": "Budapest",
            "email": "teszt@example.com",
            "igeny": "nyilaszaro",
            "hozzajarulas": "igen",
        }
        r = s.post(self.URL, json=payload, timeout=25)
        assert r.status_code == 500, f"got {r.status_code}: {r.text[:300]}"
        # Message about phone contact expected
        assert re.search(r"telefon", r.text, re.IGNORECASE), f"no phone-contact message: {r.text[:300]}"

    def test_post_form_urlencoded_returns_html(self, s):
        data = {
            "nev": "Teszt Elek",
            "telefon": "+36301234567",
            "helyszin": "Budapest",
            "email": "teszt@example.com",
            "igeny": "nyilaszaro",
            "hozzajarulas": "igen",
        }
        r = s.post(self.URL, data=data, timeout=25)
        assert "text/html" in r.headers.get("Content-Type", "").lower(), (
            f"expected html, got {r.headers.get('Content-Type')}: {r.text[:200]}"
        )

    def test_post_honeypot_fake_success(self, s):
        payload = {
            "nev": "Bot",
            "telefon": "+36301234567",
            "helyszin": "X",
            "hozzajarulas": "igen",
            "website": "spam",
        }
        r = s.post(self.URL, json=payload, timeout=20)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:300]}"
        try:
            j = r.json()
        except Exception:
            pytest.fail(f"not JSON: {r.text[:200]}")
        assert j.get("ok") is True, f"ok!=True: {j}"
