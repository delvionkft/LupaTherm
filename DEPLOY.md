# Üzemeltetés — LupaTherm (Vercel)

A kód forrása ez a GitHub-repó, a hosting a **Vercel**. Minden módosítás
**itt, Claude Code-ban** történik, a Vercel a repóból deployol.

## A munkamenet

1. Megírod, mit szeretnél változtatni (itt, a chatben).
2. A módosítás GitHubra kerül.
   - **a repó alapértelmezett ága** (jelenleg `claude/premium-landing-page-design-pmmxmu`)
     → a Vercel automatikusan **éles** deployt készít.
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
| Build Command | **ne kapcsold be az Override-ot** (üres) |
| Output Directory | **ne kapcsold be az Override-ot** (üres) |
| Install Command | hagyd az alapértelmezettet (nincs függőség, pár másodperc) |
| Node.js Version | 22.x (a `package.json` `engines` mezője rögzíti) |

3. **Environment Variables** — **nem kell semmit megadni** (lásd lentebb).
4. **Deploy.**
5. Settings → Git → **Production Branch**: a Vercel importáláskor a GitHub-repó
   alapértelmezett ágát állítja be (jelenleg
   `claude/premium-landing-page-design-pmmxmu`). Ha az élesítést másik ágra
   teszed át (pl. `main`), **mindkét helyen** állítsd át: GitHub → Settings →
   Default branch, és Vercel → Settings → Git → Production Branch.

### Miért nincs build lépés — és miért NEM szabad `build` scriptet tenni a `package.json`-ba

Ha a `package.json`-ban van `"build"` script, a Vercel (Other preset)
lefuttatja, és utána egy **`public` nevű mappát keres** a kész fájlokkal.
Ilyen nincs, ezért a deploy ezzel a hibával áll le:

```
Error: [STATIC_BUILD_NO_OUT_DIR] No Output Directory named "public" found
```

`build` script nélkül a Vercel a repó gyökerét szolgálja ki (a
`.vercelignore` szűrésével). Ezt a valódi `vercel build` paranccsal
ellenőriztük.

Tiszta HTML/CSS/JS, szerveroldali kód nincs. A `package.json` csak a
fejlesztői `lint` / `check` parancsokat tartalmazza.

## Űrlapküldés: EmailJS — környezeti változó NINCS

Az űrlap a látogató böngészőjéből közvetlenül az EmailJS-nek küld
(`assets/js/main.js`, 10. blokk). Az azonosítók a kódban vannak, és ez
így helyes: az EmailJS publikus kulcsa **nem titok**, a böngészőnek
látnia kell.

| Érték | Hol |
|---|---|
| Public Key | `main.js` → `EMAILJS.publicKey` |
| Service ID | `main.js` → `EMAILJS.serviceId` (`service_dfac7xn`) |
| Template ID | `main.js` → `EMAILJS.templateId` (`template_giasuc4`) |

A sablonváltozók listája: **`URLAP.md`**.

**A Private Key soha ne kerüljön a repóba** — ahhoz itt nincs szükség.

### Kötelező védelem az EmailJS felületén

Szerver nélkül a visszaélés ellen az EmailJS-ben kell védekezni:

1. **Account → Security → engedélyezett domainek**: csak a saját
   Vercel-domain (és később a saját domain). Enélkül bárki küldhet a
   fiókod keretéből, a kódban látható kulccsal.
2. **A sablon „To Email" mezőjébe fix cím kerüljön** (pl.
   `polanyiablak@gmail.com`), **ne változó** (pl. `{{to_email}}`).
   Különben bárki tetszőleges címre küldethetne leveleket a nevedben.
3. Opcionális: EmailJS → a sablon / szolgáltatás beállításaiban
   CAPTCHA vagy küldési korlát, ha spam érkezik.

Kliensoldali védelem a kódban: kötelező mezők ellenőrzése, méhkas-mezők,
3 másodperces minimális kitöltési idő, 30 másodperces várakozás két
beküldés között. Ez a naiv botokat szűri — egy célzott támadást nem.

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
- biztonsági fejlécek: **CSP**, HSTS, `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, `COOP`

A CSP csak a ténylegesen használt külső forrásokat engedi: Google Fonts,
Meta Pixel (`connect.facebook.net`, `www.facebook.com`) és az EmailJS API
(`api.emailjs.com`, csak `connect-src`). **Ha új külső szolgáltatás kerül az oldalra** (Google Analytics,
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
4. A domaint vedd fel az EmailJS engedélyezett domainjei közé is
   (Account → Security). Ha elmarad, a saját domainről az űrlap nem küld.
5. Csak ezután: Emergent-deploy leállítása.

## Ellenőrzőlista minden éles deploy után

- [ ] A főoldal betölt, a képek látszanak, a sütisáv megjelenik.
- [ ] `https://<domain>/valami-nem-letezo` → formázott 404-oldal.
- [ ] `https://<domain>/DEPLOY.md` és `https://<domain>/docs/README.md` → **404**.
      Ha 200, a `.vercelignore` nem érvényesült — azonnal szólj.
- [ ] Próbaajánlatkérés **mindkét űrlapról**, a levél megérkezik.
- [ ] Ha nem érkezik: F12 → Console, a `[urlap] EmailJS hiba …` sor
      megmondja az okot (rossz kulcs, nem engedélyezett domain, rossz sablon).
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

### 3. EmailJS védelem

- Az „Űrlapküldés: EmailJS" fejezet két kötelező beállítása
  (engedélyezett domainek, fix címzett a sablonban).

### 4. Hiányzó tartalom

- `assets/img/logo.svg` — a valódi logó helye. Amíg nincs ott, tartalék jel
  látszik. A fájl bemásolása elég, kódmódosítás nem kell.
- `[TELEPÜLÉS]` — a 8 referenciakártyán, `index.html` `#referenciak`
- `[SZOLGÁLTATÁSI TERÜLET]` — felső sáv és lábléc
- `[HATÁLYBALÉPÉS DÁTUMA]` — mindhárom jogi dokumentumban
- `[EMAILJS …]` — adatkezelési tájékoztató, 07. szakasz
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

A `styles.css`, az `arak.js` és a `main.js` hivatkozása `?v=20261022c`
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
assets/css/         styles.css — minden stílus, egy fájlban
assets/js/          main.js — minden interakció; arak.js — kalkulátor-árlista
assets/img/         fotók, ikonok, megosztási kép (README.md írja le, mi micsoda)
robots.txt          keresőrobot-szabályok
sitemap.xml         oldaltérkép
vercel.json         fejlécek, gyorsítótár, cleanUrls
.vercelignore       ami NEM kerül ki a Vercelre
docs/               belső munkaanyagok (nem publikus)
URLAP.md            az űrlap mezői és az EmailJS-sablon változói
```

## Amit ne csinálj

- Ne szerkessz fájlt a Vercel felületén vagy más hostingon — a forrás a repó.
- Ne nevezd át a fájlokat/mappákat — a főoldal hivatkozásai relatív útvonalak.
- Ne töröld az `assets/img/README.md`-t, az írja le, melyik fotó hova tartozik.
