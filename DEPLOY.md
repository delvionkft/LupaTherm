# Üzemeltetés — LupaTherm (Vercel)

A kód forrása ez a GitHub-repó, a hosting a **Vercel**. Minden módosítás
**itt, Claude Code-ban** történik, a Vercel a repóból deployol.

## A munkamenet

1. Megírod, mit szeretnél változtatni (itt, a chatben).
2. A módosítás GitHubra kerül.
   - **`main` ág** → a Vercel automatikusan **éles** deployt készít.
   - **bármely más ág** → a Vercel **preview** deployt készít saját URL-lel
     (élesítés előtti ellenőrzésre).
3. Nincs kézi feltöltés, nincs „frissítés a repóból" gomb — a push maga a deploy.

## Első beállítás — projekt importálása

1. vercel.com → **Add New… → Project** → GitHub → `delvionkft/LupaTherm` → **Import**
2. A beállítások:

| Mező | Érték |
|---|---|
| Framework Preset | **Other** |
| Root Directory | `./` |
| Build Command | hagyd az alapértelmezettet (`npm run build` — csak kiír egy sort) |
| Output Directory | **üresen hagyni** (a repó gyökere) |
| Install Command | hagyd az alapértelmezettet (nincs függőség, pár másodperc) |
| Node.js Version | 22.x (a `package.json` `engines` mezője rögzíti) |

3. **Environment Variables** — még az első Deploy előtt add meg a négy
   változót (lásd lentebb és az **`ENV.md`**-t). Ha kimarad, utólag
   beállítod, majd **Redeploy**.
4. **Deploy.**
5. Settings → Git → **Production Branch: `main`**.

### Miért nincs build lépés

Tiszta HTML/CSS/JS, plusz egyetlen serverless függvény (`api/lead.js`).
A `package.json` azért van a repóban, mert a `"type": "module"` beállítás
nélkül az `api/lead.js` nem töltődne be. **Futásidejű függősége nincs**
— a Resend és a Turnstile API-t közvetlen `fetch` hívja.

## Környezeti változók: NÉGY DARAB

`RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`

Részletek — honnan szerezhető, melyik környezetben kell, mi nem működik
nélküle: **`ENV.md`**.

> **Csapda:** ha a `TURNSTILE_SECRET_KEY` be van állítva, de az
> `index.html`-ben még a `[TURNSTILE_SITE_KEY]` helykitöltő áll, **minden
> beküldés elbukik** (403). A kettőt mindig együtt állítsd be: előbb a
> Site Key az `index.html`-be, push, utána a Secret Key a Vercelbe, redeploy.

## Mi kerül ki, mi nem — `.vercelignore`

A Vercel a repó gyökerét statikusan kiszolgálja. A `.vercelignore`
kizárja a nem publikus fájlokat:

- `docs/` — munkaanyagok (árlista, képernyőképek)
- minden `*.md` — belső dokumentáció (ez a fájl is)
- `eslint.config.js`, `.env.example`

**Ha új belső anyag kerül a repóba, a `docs/` mappába tedd** — ami máshova
kerül, az publikus lehet. Az `assets/img/` publikus képmappa.

## vercel.json

- `cleanUrls` — `/index.html` helyett `/`
- HTML: nincs gyorsítótárazás (a módosítás azonnal látszik)
- `assets/css`, `assets/js`: egy év, `immutable` — ezért kötelező a
  `?v=` verziószám emelése minden CSS/JS módosításnál (lásd lentebb)
- `assets/img`: 1 nap + `stale-while-revalidate`
- `/api/*`: `no-store`
- biztonsági fejlécek: **CSP**, HSTS, `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, `COOP`

A CSP csak a ténylegesen használt külső forrásokat engedi: Google Fonts,
Meta Pixel (`connect.facebook.net`, `www.facebook.com`), Cloudflare
Turnstile. **Ha új külső szolgáltatás kerül az oldalra** (Google Analytics,
chat-widget, beágyazott videó), a CSP-t bővíteni kell, különben a böngésző
csendben blokkolja.

A Vercel preview-deployokon a Vercel Toolbar (`vercel.live`) a CSP miatt
nem töltődik be — ez szándékos, az oldal működését nem érinti.

## A 404-oldal

A Vercel ismeretlen útvonalon a gyökérben lévő `404.html`-t adja vissza,
404-es státusszal. Az oldal **abszolút** (`/assets/…`) hivatkozásokat
használ, mert bármilyen mély útvonalon megjelenhet — relatív úttal a
`/valami/mely/utvonal` címen stílus nélkül jelenne meg.

## Átköltözés Emergentről

Az Emergentet **csak akkor** kapcsold le, ha a Vercel-oldal már bizonyítottan
működik — különben lesz egy időszak, amikor az oldal nem érhető el.

1. Vercel-deploy kész, a `*.vercel.app` címen az ellenőrzőlista (lentebb) zöld.
2. Ha van saját domain: Vercel → projekt → **Settings → Domains → Add**.
   A Vercel kiírja a szükséges DNS-rekordokat (jellemzően apex domainre
   `A 76.76.21.21`, `www`-re `CNAME cname.vercel-dns.com`) — **a Vercel
   által kiírt értéket** állítsd be a domainszolgáltatónál.
3. Várd meg, amíg a Vercel a domaint „Valid Configuration"-nek jelzi és a
   HTTPS-tanúsítvány elkészül.
4. A domaint vedd fel ide is:
   - Cloudflare Turnstile → a site hostnevei közé
   - Resend → Domains (a feladócímhez, ha még nincs igazolva)
5. Csak ezután: Emergent-deploy leállítása.

## Ellenőrzőlista minden éles deploy után

- [ ] A főoldal betölt, a képek látszanak, a sütisáv megjelenik.
- [ ] `https://<domain>/valami-nem-letezo` → formázott 404-oldal.
- [ ] `https://<domain>/DEPLOY.md` és `https://<domain>/docs/README.md` → **404**.
      Ha 200, a `.vercelignore` nem érvényesült — azonnal szólj.
- [ ] Próbaajánlatkérés **mindkét űrlapról**, a levél megérkezik.
- [ ] Legalább egy próbánál csatolj egy telefonfotót és egy kis PDF-et — a levélben mellékletként ott vannak.
- [ ] Vercel → **Logs**: nincs `[lead] hianyzo kornyezeti valtozo` sor.
- [ ] Böngésző konzol (F12): nincs piros `Content-Security-Policy` hiba.

## ÉLESÍTÉSI TEENDŐK

Ezek nélkül az oldal működik, de nem található meg keresőben.

### 1. Domain beírása — 4 hely, egy find-replace

Cseréld a `https://[DOMAIN]` szövegrészt a valódi címre:

- `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image`
- `sitemap.xml` — `<loc>`
- `robots.txt` — `Sitemap:` sor (a kikommentelt blokkban)

### 2. Indexelés engedélyezése — csak a végleges domainen

- `index.html`: töröld a `<meta name="robots" content="noindex, nofollow">` sort
- `robots.txt`: töröld a `Disallow: /` sort, és vedd ki a kommentből az alsó blokkot
- A `404.html` `noindex` sora **maradjon**

### 3. Turnstile és éles teszt

- Írd be a Turnstile **Site Key**-t az `index.html`-be a
  `[TURNSTILE_SITE_KEY]` helyére (két helyen, mindkét űrlapban).
  Amíg a helykitöltő áll, a `main.js` be sem tölti a Cloudflare szkriptet.
- Utána állítsd be a `TURNSTILE_SECRET_KEY`-t, és redeploy (lásd a fenti csapdát).

### 4. Hiányzó tartalom

- `assets/img/logo.svg` — a valódi logó helye. Amíg nincs ott, tartalék jel
  látszik. A fájl bemásolása elég, kódmódosítás nem kell.
- `[TELEPÜLÉS]` — a 8 referenciakártyán, `index.html` `#referenciak`
- `[SZOLGÁLTATÁSI TERÜLET]` — felső sáv és lábléc
- `[HATÁLYBALÉPÉS DÁTUMA]` — mindhárom jogi dokumentumban
- `[RESEND …]`, `[CLOUDFLARE …]` — adatkezelési tájékoztató, 07. szakasz
- A Vercel Inc. adatai (impresszum 02. és tájékoztató 07.) ki vannak töltve
  — élesítés előtt egyszer vesd össze a vercel.com/legal oldallal.

## Süti-hozzájárulás és Meta Pixel

A Meta Pixel (azonosító: 962398476156311) **csak a sütisávon adott
kifejezett elfogadás után** töltődik be. Elutasításnál semmilyen kérés nem
indul a Meta felé. A döntés a lábléc „Süti-beállítások" linkjével
visszavonható.

Ha később további eszköz kerül az oldalra (Google Analytics, Google Ads),
azt **fel kell venni a süti szabályzat 03. szakaszába**, a hozzájárulás
mögé kell tenni, és a CSP-t bővíteni kell.

## Kalkulátor

Az oldalon van egy **helyben számoló** kalkulátor (SZ—05). Nem küld
adatot sehova, nincs hálózati kérése.

Az árakat egyetlen fájlból veszi: **`assets/js/arak.js`**.

**Jelenleg ez a fájl üres, és a kalkulátor emiatt REJTVE van** — a szekció
és a menüpontja sem jelenik meg. Szándékos: így nem kerülhet ki kitalált
vagy nullás ár.

Bekapcsolás:

1. Töltsd ki az értékeket az `arak.js`-ben (nettó forint).
2. Állítsd az `aktiv` mezőt `true`-ra.
3. Emeld a `?v=` verziószámot (lásd lentebb), és pusholj.

Ha az `aktiv` true, de egyetlen valódi egységár sincs kitöltve, akkor is
rejtve marad. Az eredmény szándékosan **sáv** (alapból ±15%, a
`savSzazalek` mezővel állítható), nem egyetlen szám.

## Gyorsítótár — verziószám

A `styles.css`, az `arak.js` és a `main.js` hivatkozása `?v=20261022b`
végződést kap az `index.html`-ben (a CSS a `404.html`-ben is).
**Minden CSS/JS módosítás után ezt a számot emelni kell** — a
`vercel.json` egy évre, `immutable`-ként gyorsítótárazza ezeket a
fájlokat, így verzióemelés nélkül a látogatók a régit kapják.

## Fájlszerkezet

```
index.html          a teljes főoldal (a jogi dokumentumok is ebben vannak,
                    panelként: #impresszum, #adatkezelesi-tajekoztato,
                    #suti-szabalyzat)
404.html            hibaoldal
api/lead.js         Vercel serverless függvény — űrlapfeldolgozás, levélküldés
assets/css/         styles.css — minden stílus, egy fájlban
assets/js/          main.js — minden interakció; arak.js — kalkulátor-árlista
assets/img/         fotók, ikonok, megosztási kép (README.md írja le, mi micsoda)
robots.txt          keresőrobot-szabályok
sitemap.xml         oldaltérkép
vercel.json         fejlécek, gyorsítótár, cleanUrls
.vercelignore       ami NEM kerül ki a Vercelre
docs/               belső munkaanyagok (nem publikus)
ENV.md              a négy környezeti változó
URLAP.md            az űrlap mezőnevei
```

## Amit ne csinálj

- Ne szerkessz fájlt a Vercel felületén vagy más hostingon — a forrás a repó.
- Ne nevezd át a fájlokat/mappákat — a főoldal hivatkozásai relatív útvonalak.
- Ne tedd a `package.json`-t a `.vercelignore`-ba — az API leállna.
- Ne töröld az `assets/img/README.md`-t, az írja le, melyik fotó hova tartozik.
