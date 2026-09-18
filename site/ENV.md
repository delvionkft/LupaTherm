# Környezeti változók — Vercel

**Egyik értéket sem szabad a repóba írni.** A valódi értékek kizárólag a
Vercel *Settings → Environment Variables* felületén élnek. A `.env.example`
csak minta, üres értékekkel.

## A négy változó

### 1. `RESEND_API_KEY` — TITKOS

| | |
|---|---|
| **Típus a Vercelben** | **Secret** (nem olvasható vissza mentés után) |
| **Honnan szerzed** | resend.com → bejelentkezés → **API Keys** → *Create API Key*. Jogosultság: elég a `Sending access`. A kulcs **csak egyszer** jelenik meg — mentsd el jelszókezelőbe. |
| **Production** | **Kötelező** |
| **Preview** | Ajánlott. Nélküle a preview-deployokon az űrlap 500-as hibát ad. Használhatsz külön, korlátozott kulcsot. |
| **Nélküle** | Az űrlap **nem küld levelet**. A látogató ezt látja: „A küldés átmenetileg nem érhető el… hívj minket telefonon". A beküldött adat elvész. |

### 2. `LEAD_TO_EMAIL` — nem titkos, de szerveroldali

| | |
|---|---|
| **Típus a Vercelben** | Config |
| **Honnan szerzed** | Te döntöd el: ide érkeznek az ajánlatkérések. Jelenleg kézenfekvő: `polanyiablak@gmail.com` |
| **Production** | **Kötelező** |
| **Preview** | Ajánlott — érdemes teszt-címet megadni, hogy a próbabeküldések ne keveredjenek az éles leadekkel |
| **Nélküle** | Ugyanaz, mint a kulcs hiányánál: nincs levélküldés. |

**Miért szerveroldali:** ha a címzett a kliensoldalon lenne, bárki átírhatná,
és a te nevedben küldethetne levelet tetszőleges címre. A szerver a
kliens `to` mezőjét eldobja.

### 3. `LEAD_FROM_EMAIL` — nem titkos, de szerveroldali

| | |
|---|---|
| **Típus a Vercelben** | Config |
| **Honnan szerzed** | resend.com → **Domains** → domain hozzáadása és a DNS-rekordok beállítása. Csak **igazolt domainről** lehet küldeni. Például: `noreply@lupatherm.hu` |
| **Production** | **Kötelező** |
| **Preview** | Ajánlott |
| **Nélküle** | Nincs levélküldés. Ha nem igazolt domaint adsz meg, a Resend elutasítja, és a látogató hibaüzenetet kap. |

### 4. `TURNSTILE_SECRET_KEY` — TITKOS

| | |
|---|---|
| **Típus a Vercelben** | **Secret** |
| **Honnan szerzed** | dash.cloudflare.com → **Turnstile** → *Add Site* → a domain megadása. Két kulcsot kapsz: **Site Key** (publikus) és **Secret Key** (ez az). |
| **Production** | Erősen ajánlott |
| **Preview** | Ajánlott |
| **Nélküle** | A CAPTCHA-ellenőrzés **kimarad** — az űrlap működik, de csak a méhkas, az időzítés-ellenőrzés és a kérésszámlálás véd a botok ellen. A szerver ilyenkor figyelmeztetést naplóz. |

**A Site Key nem ide megy:** az publikus érték, és az `index.html`-be kell
beírni a `[TURNSTILE_SITE_KEY]` helyére (két helyen, mindkét űrlapban).

## Ami NEM megy környezeti változóba

| Érték | Hol van | Miért nem titkos |
|---|---|---|
| Meta Pixel azonosító | `assets/js/main.js`, `PIXEL_ID` | Minden pixel látható a forrásban; azonosításra való, nem hitelesítésre |
| Turnstile **Site** Key | `index.html`, `data-sitekey` | A Cloudflare kifejezetten publikusnak szánja; a védelmet a Secret Key adja |

Build lépés nélküli statikus oldal nem tud környezeti változót olvasni —
ezért maradnak ezek a forrásban. A szerveroldali `api/lead.js` viszont
**kizárólag** `process.env`-ből olvas titkot.

## Beállítás lépésről lépésre

1. Vercel → a projekt → **Settings → Environment Variables**
2. Mind a négy változóhoz: *Add new variable*
   - `RESEND_API_KEY` és `TURNSTILE_SECRET_KEY` → típus **Secret**
   - `LEAD_TO_EMAIL` és `LEAD_FROM_EMAIL` → típus **Config**
3. Environments: jelöld be a **Production**-t (és a Preview-t, ha ott is tesztelsz)
4. **Redeploy** — a meglévő deploy nem veszi át az új változókat magától

## Ellenőrzés élesben

- Küldj be egy próbaajánlatkérést, és nézd meg, megérkezik-e a levél.
- Vercel → **Logs**: ha a `[lead] hianyzo kornyezeti valtozo` sor megjelenik,
  a felsorolt változó nincs beállítva vagy nincs redeploy.
- Ha a `[lead] TURNSTILE_SECRET_KEY nincs beallitva` sor jelenik meg,
  a CAPTCHA ki van hagyva — a többi védelem működik.
