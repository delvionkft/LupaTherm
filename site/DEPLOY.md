# Üzemeltetés — LupaTherm

Az **Emergent csak hosting**. A kód forrása ez a GitHub-repó, és minden
módosítás **itt, Claude Code-ban** történik. Emergentben soha ne szerkeszd
a fájlokat — ha ott is módosítasz, a két változat szétválik, és a következő
pusholás felülírja az ottani munkát.

## A munkamenet

1. Megírod, mit szeretnél változtatni (itt, a chatben).
2. A módosítás a `main` ágra kerül, feltolva GitHubra.
3. Emergentben frissítesz a repóból (pull / re-deploy).

Nincs build lépés, nincs függőség. Ami a repóban van, az megy ki 1:1.

## Vercel-publikálás

### Ez a projekt NEM buildel

Tiszta HTML/CSS/JS. **Nincs `package.json`, nincs `node_modules`, nincs
build lépés, nincs függőség.** A Vercel a fájlokat változatlanul szolgálja ki.

Beállítások a Vercel felületén, a projekt importálásakor:

| Mező | Érték |
|---|---|
| Framework Preset | **Other** |
| Build Command | **üresen hagyni** (kapcsold ki az Override-ot) |
| Output Directory | **üresen hagyni** (a repó gyökere) |
| Install Command | **üresen hagyni** |
| Root Directory | `./` |
| Production Branch | `main` |

Ha a Vercel build parancsot kér, ne adj meg semmit. Egy kitalált
`npm run build` itt csak hibára futna, mert nincs mit buildelni.

### Környezeti változók: NÉGY DARAB

Az űrlapbeküldés szerveroldali végpontra költözött (`api/lead.js`), ezért
mostantól **négy környezeti változót kell beállítani** a Vercelben:
`RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`.

Részletes leírás — honnan szerezhető, melyik környezetben kell, mi nem
működik nélküle: **`ENV.md`**.

### Korábbi állapot (már nem érvényes)

A Vercel „Environment Variables" szekciójában **nem kell semmit megadni**.

Ennek oka nem feledékenység: build lépés nélküli statikus oldal
**nem tud** környezeti változót olvasni — nincs szerveroldali kód és
nincs build, ami behelyettesítené. Minden érték a forrásban van:

| Érték | Hol van | Titkos? |
|---|---|---|
| EmailJS public key | `assets/js/main.js` (`EMAILJS.publicKey`) | Nem — szándékosan publikus |
| EmailJS service / template ID | `assets/js/main.js` | Nem |
| Meta Pixel azonosító | `index.html` fejléc | Nem — minden pixel látható a forrásban |

**Az EmailJS public key védelme nem titkosítással történik, hanem
domainkorlátozással.** EmailJS → Account → Security → engedélyezett
domainek: vedd fel a Vercel-domaint (és később a saját domaint).
Enélkül bárki küldhet a fiókod keretéből.

Ha valaha **valódi titok** kerülne a projektbe (SMTP-jelszó, API secret),
az nem mehet a forrásba — akkor Vercel Function kell hozzá, és csak ott
van értelme környezeti változónak.

### vercel.json

A repóban lévő `vercel.json` állítja be:

- `cleanUrls` — `/index.html` helyett `/`
- HTML: nincs gyorsítótárazás (a módosítás azonnal látszik)
- `assets/css`, `assets/js`: egy év, `immutable` — ezért fontos a
  `?v=` verziószám emelése minden módosításnál (lásd lentebb)
- `assets/img`: 1 nap + `stale-while-revalidate`
- biztonsági fejlécek: `nosniff`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`

CSP-t szándékosan nem állítottam be: rosszul megírva megbénítaná az
EmailJS-t és a Meta Pixelt. Ha kell, külön kell összeállítani és tesztelni.

### A 404-oldal

A Vercel statikus projektnél automatikusan a gyökérben lévő `404.html`-t
szolgálja ki ismeretlen útvonalon. Nincs vele teendő.

## Fájlszerkezet

```
index.html          a teljes főoldal (a jogi dokumentumok is ebben vannak,
                    panelként: #impresszum, #adatkezelesi-tajekoztato,
                    #suti-szabalyzat)
404.html            hibaoldal
robots.txt          keresőrobot-szabályok
sitemap.xml         oldaltérkép
assets/css/         styles.css — minden stílus, egy fájlban
assets/js/          main.js — minden interakció, egy fájlban
assets/img/         fotók, ikonok, megosztási kép (README.md írja le, mi micsoda)
URLAP.md            az űrlap mezőnevei a CRM-/e-mail-sablonhoz
```

## ÉLESÍTÉSI TEENDŐK

Ezek nélkül az oldal működik, de nem található meg és nem gyűjt leadet.

### 1. Domain beírása — 4 hely, egy find-replace

Cseréld a `https://[DOMAIN]` szövegrészt a valódi címre:

- `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image`
- `sitemap.xml` — `<loc>`
- `robots.txt` — `Sitemap:` sor (a kikommentelt blokkban)

### 2. Indexelés engedélyezése

- `index.html`: töröld a `<meta name="robots" content="noindex, nofollow">` sort
- `robots.txt`: töröld a `Disallow: /` sort, és vedd ki a kommentből az alsó blokkot
- A `404.html` `noindex` sora **maradjon** — hibaoldal ne kerüljön keresőbe

### 3. Környezeti változók és éles teszt

- Állítsd be a négy változót a Vercelben — lásd **`ENV.md`**, majd **redeploy**.
- Írd be a Turnstile **Site Key**-t az `index.html`-be a
  `[TURNSTILE_SITE_KEY]` helyére (két helyen, mindkét űrlapban).
- Küldj be egy próbaajánlatkérést **mindkét űrlapról** (hero alatti és
  záró szekció), és nézd meg, megérkezik-e a levél.

### 4. Hiányzó tartalom

- `assets/img/hero.jpg` — a hero szekció képe. Amíg nincs ott, helykitöltő
  panel látszik. Álló tájolás, kb. 3:4.
- `assets/img/logo.svg` — a valódi logó helye. Amíg nincs ott, a fejlécben
  és a láblécben egy tartalék jel látszik. A fájl bemásolása elég,
  kódmódosítás nem kell.
- `[TELEPÜLÉS]` — a 8 referenciakártyán, `index.html` `#referenciak`
- `[SZOLGÁLTATÁSI TERÜLET]` — felső sáv és lábléc
- `[HATÁLYBALÉPÉS DÁTUMA]` — mindhárom jogi dokumentumban
- `[TÁRHELYSZOLGÁLTATÓ ...]` — impresszum, 02. szakasz (Emergent adatai)
- `[ŰRLAP- VAGY CRM-SZOLGÁLTATÓ ...]` — adatkezelési tájékoztató, 07. szakasz

### 5. Sütikezelő sáv — NYITOTT KÉRDÉS

Az oldalon **fut a Meta Pixel** (azonosító: 962398476156311). Ez hirdetési
célú követőkód, amelynek betöltéséhez az EU-ban a látogató **előzetes
hozzájárulása** kellene. Jelenleg a pixel **hozzájárulás nélkül, azonnal
betölt**.

A süti szabályzat 03. szakasza már helyesen felsorolja a pixelt, tehát a
tájékoztatás megvan — a **hozzájárulás bekérése hiányzik**. Sütikezelő sáv
beüzemelésekor a pixelt a hozzájárulás mögé kell tenni.

Ha később további eszköz kerül az oldalra (Google Analytics, Google Ads),
azt is **fel kell venni a 03. szakaszba**.

## Kalkulátor

Az oldalon van egy **helyben számoló** kalkulátor (SZ—05). Nem küld
adatot sehova, nincs hálózati kérése, és nem kell hozzá ajánlatot kérni.

Az árakat egyetlen fájlból veszi: **`assets/js/arak.js`**.

**Jelenleg ez a fájl üres, és a kalkulátor emiatt REJTVE van** — a szekció
és a hozzá tartozó menüpont sem jelenik meg. Ez szándékos védelem: így
nem kerülhet ki kitalált vagy nullás ár a látogató elé.

Bekapcsolás:

1. Töltsd ki az értékeket az `arak.js`-ben (nettó forint).
2. Állítsd az `aktiv` mezőt `true`-ra.
3. Emeld a `?v=` verziószámot (lásd lentebb), és deployolj.

A kalkulátor kétszeresen véd a hibás megjelenés ellen: ha az `aktiv`
true, de egyetlen valódi egységár sincs kitöltve, akkor is rejtve marad.

Az eredmény szándékosan **sáv**, nem egyetlen szám (alapból ±15%, a
`savSzazalek` mezővel állítható) — egy pontos szám hamis pontosságot
sugallna egy felmérés előtti becslésnél.

## Gyorsítótár — verziószám

A `styles.css` és a `main.js` hivatkozása `?v=20260911a` végződést kap
az `index.html`-ben és a `404.html`-ben. **Minden CSS/JS módosítás után
ezt a számot emelni kell**, különben a látogatók böngészője és a hosting
CDN-je a régi fájlt szolgálja ki, és a változás nem látszik.

Emergentben deploy után érdemes egy erős frissítéssel (Ctrl+F5 / Cmd+Shift+R)
ellenőrizni.

## Amit ne csinálj

- Ne szerkeszd a fájlokat Emergentben.
- Ne nevezd át a fájlokat/mappákat — a hivatkozások relatív útvonalak.
- Ne töröld az `assets/img/README.md`-t, az írja le, melyik fotó hova tartozik.
