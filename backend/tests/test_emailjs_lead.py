"""EmailJS server-side send tests for POST /api/lead (LupaTherm).

NOTE: Valid JSON submissions will send REAL emails through EmailJS. This is
expected per the review request.
"""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://lupatherm-preview-1.preview.emergentagent.com",
).rstrip("/")

LEAD_URL = BASE_URL + "/api/lead"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


VALID_JSON = {
    "nev": "QA Teszt",
    "telefon": "+36301234567",
    "helyszin": "Budapest",
    "email": "qa@example.com",
    "igeny": "nyilaszaro",
    "idozites": "azonnal",
    "ingatlan": "csaladi-haz",
    "darabszam": "4-8",
    "uzenet": "QA test",
    "forras": "hero-urlap",
    "hozzajarulas": "igen",
}


# ------------- 1. EmailJS server-side send (JSON) -------------
class TestEmailJSSend:
    def test_json_post_returns_200_ok_true(self, s):
        r = s.post(LEAD_URL, json=VALID_JSON, timeout=30)
        assert r.status_code == 200, f"expected 200, got {r.status_code}: {r.text[:400]}"
        ct = r.headers.get("Content-Type", "").lower()
        assert "application/json" in ct, f"expected JSON, got {ct}: {r.text[:200]}"
        j = r.json()
        assert j.get("ok") is True, f"ok!=True: {j}"

    def test_json_response_has_no_store(self, s):
        r = s.post(LEAD_URL, json=VALID_JSON, timeout=30)
        cc = r.headers.get("Cache-Control", "").lower()
        assert "no-store" in cc, f"missing no-store: {cc}"

    def test_json_response_has_security_headers(self, s):
        r = s.post(LEAD_URL, json=VALID_JSON, timeout=30)
        h = {k.lower(): v for k, v in r.headers.items()}
        assert "content-security-policy" in h
        assert h.get("x-content-type-options", "").lower() == "nosniff"
        assert "strict-transport-security" in h
        assert "referrer-policy" in h
        assert "permissions-policy" in h


# ------------- 2. JS-less native form submission -------------
class TestFormEncodedSubmission:
    def test_form_post_returns_html_success(self, s):
        data = {
            "nev": "QA Form Teszt",
            "telefon": "+36301234567",
            "helyszin": "Budapest",
            "hozzajarulas": "igen",
            "igeny": "nyilaszaro",
            "forras": "hero-urlap",
        }
        r = s.post(
            LEAD_URL,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30,
        )
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:300]}"
        ct = r.headers.get("Content-Type", "").lower()
        assert "text/html" in ct, f"expected html, got {ct}"
        assert "Köszönjük" in r.text, f"missing success text: {r.text[:400]}"


# ------------- 3. Validation still enforced -------------
class TestValidation:
    def test_get_returns_405(self, s):
        r = s.get(LEAD_URL, timeout=15)
        assert r.status_code == 405, f"expected 405, got {r.status_code}"

    def test_missing_name_returns_422(self, s):
        payload = dict(VALID_JSON)
        payload.pop("nev")
        r = s.post(LEAD_URL, json=payload, timeout=20)
        assert r.status_code == 422, f"expected 422, got {r.status_code}: {r.text[:300]}"
        # Expect some Hungarian message
        assert r.text.strip(), "empty body"
        # Check for Hungarian language indicator - accented chars or common HU words
        assert re.search(r"(mez|név|k[öo]telez|hi[aá]nyz|megad)", r.text, re.IGNORECASE), \
            f"no Hungarian validation message: {r.text[:300]}"

    def test_honeypot_returns_fake_success(self, s):
        payload = dict(VALID_JSON)
        payload["website"] = "spam"
        r = s.post(LEAD_URL, json=payload, timeout=20)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:300]}"
        j = r.json()
        assert j.get("ok") is True, f"honeypot expected ok:true, got {j}"


# ------------- 4. No secret leakage to browser -------------
class TestNoSecretLeakage:
    FORBIDDEN_STRINGS = [
        "EMAILJS_PRIVATE_KEY",
        "BRiMjwNkGpZnZZWd7O-kL",  # private key value
        "api.emailjs.com",
    ]

    def _assert_clean(self, text, source):
        for s_ in self.FORBIDDEN_STRINGS:
            assert s_ not in text, f"FOUND forbidden string '{s_}' in {source}"

    def test_homepage_html_clean(self, s):
        r = s.get(BASE_URL + "/", timeout=15)
        assert r.status_code == 200
        self._assert_clean(r.text, "homepage HTML")

    def test_main_js_clean(self, s):
        r = s.get(BASE_URL + "/assets/js/main.js", timeout=15)
        if r.status_code == 200:
            self._assert_clean(r.text, "/assets/js/main.js")
        else:
            # Try common alternates
            for path in ["/assets/js/app.js", "/assets/js/site.js"]:
                r2 = s.get(BASE_URL + path, timeout=15)
                if r2.status_code == 200:
                    self._assert_clean(r2.text, path)
                    return
            pytest.skip("main.js not found (404) - skipping JS leak check")
