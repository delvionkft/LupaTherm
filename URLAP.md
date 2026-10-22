# Űrlap → EmailJS-sablon változói

Az oldalon **két űrlap** van (hero alatti és záró szekció). Mindkettő
ugyanazokat a változókat küldi ugyanabba a sablonba:

| | |
|---|---|
| Service ID | `service_dfac7xn` |
| Template ID | `template_giasuc4` |
| Hol van a kódban | `assets/js/main.js`, 10. blokk — `EMAILJS` és `templateParams()` |

## Sablonváltozók

A sablonban `{{valtozo}}` formában használhatók. **Mind a 13 változó
mindig kap értéket** — ami nincs kitöltve, az `nincs megadva` lesz,
így a sablonban nem marad üres hely.

| Változó | Mi ez | Példa |
|---|---|---|
| `{{nev}}` | Név (kötelező) | Kovács Anna |
| `{{telefon}}` | Telefonszám (kötelező) | +36 30 123 4567 |
| `{{email}}` | E-mail-cím | anna@example.com / nincs megadva |
| `{{helyszin}}` | Hol van az ingatlan (kötelező) | Sárosd |
| `{{ingatlan}}` | Milyen ingatlan | Családi ház / Társasházi lakás / Egyéb (iroda, üzlet) |
| `{{darabszam}}` | Hány nyílászáró | 1–3 db / 4–8 db / 8 db felett |
| `{{igeny}}` | Mire van szüksége | Nyílászáró / Bejárati ajtó / Árnyékolás (redőny, zsalúzia) / Komplett megoldás |
| `{{idozites}}` | Mikor tervezi | Most azonnal / 1–3 hónapon belül / Még csak tájékozódom |
| `{{uzenet}}` | Megjegyzés | szabad szöveg / nincs megadva |
| `{{forras}}` | Melyik űrlapról jött | Hero szekció űrlapja / Záró szekció űrlapja |
| `{{hozzajarulas}}` | Adatkezelési hozzájárulás | Elfogadva (enélkül nem küldhető) |
| `{{idopont}}` | Beküldés ideje (budapesti idő) | 2026. 10. 22. 10:03:09 |
| `{{oldal_url}}` | Melyik oldalról küldték | https://…vercel.app/ |

A rádiós válaszok **olvasható magyar szövegként** érkeznek, nem gépi
kulcsként. Új válaszlehetőségnél a `main.js` `LABELS` objektumát is
bővíteni kell.

**Ha a sablonban átnevezel egy változót, a `main.js` `templateParams()`
függvényében is át kell nevezni** — különben az a mező üresen érkezik.

Javasolt tárgysor a sablonban:

```
Ajánlatkérés — {{igeny}} — {{nev}}
```

Javasolt „Reply To": `{{email}}` — így a Válasz gomb a látogatónak
válaszol. (Ha nem adott meg címet, a mező `nincs megadva` lesz; ilyenkor
telefonon kell keresni.)

**A „To Email" mező fix cím legyen, ne változó** — lásd `DEPLOY.md`,
„Kötelező védelem az EmailJS felületén".

## Mezők az oldalon

| Mező (`name`) | Kérdés | Kötelező | Típus |
|---|---|:--:|---|
| `ingatlan` | Milyen ingatlanról van szó? | nem | rádió |
| `darabszam` | Hány nyílászárót érint a csere? | nem | rádió |
| `igeny` | Mire van szükséged? | nem | rádió |
| `idozites` | Mikor tervezed a cserét? | nem | rádió |
| `nev` | Név | **igen** | szöveg |
| `telefon` | Telefonszám | **igen** | tel |
| `email` | E-mail-cím | nem | email |
| `helyszin` | Hol van az ingatlan? | **igen** | szöveg |
| `uzenet` | Megjegyzés | nem | többsoros |
| `hozzajarulas` | Adatkezelési tájékoztató elfogadása | **igen** | jelölőnégyzet |

Rejtett mezők (nem mennek a sablonba):

| Mező | Szerep |
|---|---|
| `forras` | `hero-urlap` / `zaro-urlap` — a sablonba olvasható szövegként megy |
| `ts` | a kitöltés kezdete; 3 másodpercnél gyorsabb beküldés = automata |
| `website`, `cegnev_megerosites` | méhkas — ember nem látja; ha ki van töltve, nem megy levél |

Méhkas és túl gyors kitöltés esetén a látogató sikeres üzenetet lát, de
levél nem megy ki — így a bot nem tanul a hibából.

## Ha nem érkezik levél

Böngésző → F12 → **Console**. A `[urlap] EmailJS hiba <státusz>: <üzenet>`
sor az EmailJS saját hibaüzenetét mutatja, például rossz kulcs, nem
engedélyezett domain, vagy nem létező sablon.
