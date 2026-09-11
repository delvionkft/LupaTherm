# Űrlapmezők — változónevek a sablonhoz

Az oldalon **két űrlap** van (hero alatti és záró szekció), de mindkettő
**ugyanazokat a mezőneveket** küldi. Egyetlen sablon kiszolgálja mindkettőt;
a `forras` mezőből derül ki, melyikről érkezett a lead.

## Mezők

| Változó | Kérdés az oldalon | Kötelező | Típus | Lehetséges értékek |
|---|---|:--:|---|---|
| `forras` | — (rejtett) | automatikus | rejtett | `hero-urlap`, `zaro-urlap` |
| `ingatlan` | Milyen ingatlanról van szó? | nem | rádió | `csaladi-haz`, `tarsashaz`, `egyeb` |
| `darabszam` | Hány nyílászárót érint a csere? | nem | rádió | `1-3`, `4-8`, `8-plusz` |
| `igeny` | Mire van szükséged? | nem | rádió | `nyilaszaro`, `bejarati-ajto`, `arnyekolas`, `komplett` |
| `idozites` | Mikor tervezed a cserét? | nem | rádió | `azonnal`, `1-3-honap`, `tajekozodom` |
| `nev` | Név | **igen** | szöveg | szabad szöveg |
| `telefon` | Telefonszám | **igen** | tel | szabad szöveg |
| `email` | E-mail-cím | nem | email | szabad szöveg |
| `helyszin` | Hol van az ingatlan? | **igen** | szöveg | település vagy megye |
| `uzenet` | Megjegyzés | nem | többsoros | hozzávetőleges méretek, egyéb tudnivaló |
| `hozzajarulas` | Adatkezelési tájékoztató elfogadása | **igen** | jelölőnégyzet | `igen` |

## Fontos a sablonhoz

**A négy rádiós kérdés nem kötelező.** Ha a látogató nem választ, az adott mező
**egyáltalán nem szerepel a beküldésben** (nem üres string, hanem hiányzik).
A sablonban kezeld hiányzóként — pl. `{{ingatlan|default:"nincs megadva"}}`.

**A jelölőnégyzet** csak akkor kerül be, ha be van pipálva — akkor `hozzajarulas=igen`.
Bepipálás nélkül az űrlap nem küldhető be, tehát a beküldésben mindig ott lesz.

## Értékek → emberi szöveg

A beküldött értékek gépi kulcsok. Ha a sablonban olvasható szöveg kell:

| Változó | Kulcs | Megjelenítendő szöveg |
|---|---|---|
| `ingatlan` | `csaladi-haz` | Családi ház |
| | `tarsashaz` | Társasházi lakás |
| | `egyeb` | Egyéb (iroda, üzlet) |
| `darabszam` | `1-3` | 1–3 db |
| | `4-8` | 4–8 db |
| | `8-plusz` | 8 db felett |
| `igeny` | `nyilaszaro` | Nyílászáró |
| | `bejarati-ajto` | Bejárati ajtó |
| | `arnyekolas` | Árnyékolás (redőny, zsalúzia) |
| | `komplett` | Komplett megoldás |
| `idozites` | `azonnal` | Most azonnal |
| | `1-3-honap` | 1–3 hónapon belül |
| | `tajekozodom` | Még csak tájékozódom |
| `forras` | `hero-urlap` | Hero szekció űrlapja |
| | `zaro-urlap` | Záró szekció űrlapja |

## Beküldés — EmailJS

Az űrlap az **EmailJS**-en keresztül küld. A beállítások az
`assets/js/main.js` 10. blokkjában, az `EMAILJS` objektumban vannak.

**FONTOS:** az EmailJS felületén (Account → Security) korlátozd az
engedélyezett domainekre. A publikus kulcs látszik a kódban — ez így
működik, de korlátozás nélkül bárki küldhet a fiókod keretéből.

### Amit az EmailJS-sablon kap

A JS **nem a nyers mezőneveket küldi**, hanem olvasható magyar szöveget:
`csaladi-haz` helyett `Családi ház`. Ha egy rádiós kérdésre nem válaszolt
a látogató, az érték `nincs megadva` — tehát **a sablonban egyik változó
sem lesz üres**.

| Sablonváltozó | Tartalom |
|---|---|
| `{{forras}}` | Hero szekció űrlapja / Záró szekció űrlapja |
| `{{nev}}` | Név |
| `{{telefon}}` | Telefonszám |
| `{{email}}` | E-mail-cím vagy „nincs megadva" |
| `{{helyszin}}` | Település vagy megye |
| `{{ingatlan}}` | Családi ház / Társasházi lakás / Egyéb (iroda, üzlet) |
| `{{darabszam}}` | 1–3 db / 4–8 db / 8 db felett |
| `{{igeny}}` | Nyílászáró / Bejárati ajtó / Árnyékolás (redőny, zsalúzia) / Komplett megoldás |
| `{{idozites}}` | Most azonnal / 1–3 hónapon belül / Még csak tájékozódom |
| `{{uzenet}}` | Megjegyzés vagy „nincs megadva" |
| `{{hozzajarulas}}` | Elfogadva |
| `{{idopont}}` | A beküldés időpontja |
| `{{oldal_url}}` | Melyik oldalról érkezett |

Ha új válaszlehetőség kerül egy rádiós kérdésbe, a `main.js` `LABELS`
objektumát is bővíteni kell, különben a gépi kulcs megy az e-mailbe.

Élesítés előtt még: az `index.html` fejlécéből törlendő a
`<meta name="robots" content="noindex, nofollow">` sor.
