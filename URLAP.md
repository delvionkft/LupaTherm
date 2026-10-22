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
| `fajlok` | Fotók, tervrajz | nem | fájllista (csak JSON-os úton) | lásd lent: *Csatolt fájlok* |

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

## Beküldés — szerveroldali végpont

Az űrlapok `method="post" action="/api/lead"` beállítással működnek, tehát
**JS nélkül is szabályosan, POST törzsben küldenek** — személyes adat
semmilyen hibaesetben nem kerül az URL query paramétereibe.

Fut a JS: `fetch` hívás JSON-nel ugyanarra a végpontra, oldalváltás nélkül.

A feldolgozás az `api/lead.js`-ben történik:

1. **méhkas** (`website`, `cegnev_megerosites`) — kitöltve: látszólagos siker, nincs küldés
2. **időzítés** (`ts`) — 3 másodpercnél gyorsabb beküldés: ugyanaz
3. **kérésszámlálás** — IP-nként 5 beküldés / 10 perc
4. **Turnstile** — ha a titkos kulcs be van állítva
5. **ellenőrzés és tisztítás** — hosszkorlát, vezérlőkarakter-szűrés,
   a rádiós válaszok fix engedélyezőlistáról
6. **levél** — Resend REST API, szerveroldali címzettel és tárggyal

A kliens **nem adhat meg** címzettet, tárgyat, feladót vagy sablont: a
szerver ezeket a mezőket eldobja, és környezeti változóból veszi.
A titkos kulcsok az `ENV.md`-ben vannak dokumentálva.

### Rejtett mezők

| Mező | Szerep |
|---|---|
| `forras` | `hero-urlap` / `zaro-urlap` |
| `ts` | a kitöltés kezdetének időbélyege (bot-szűrés) |
| `website`, `cegnev_megerosites` | méhkas — ember nem látja, nem tölti ki |
| `cf-turnstile-response` | a Turnstile widget tölti ki, ha van sitekey |

Élesítés előtt még: az `index.html` fejlécéből törlendő a
`<meta name="robots" content="noindex, nofollow">` sor.

## Csatolt fájlok

A „Fotók, tervrajz" mező **csak futó JS mellett** jelenik meg, mert a
fájlokat a böngésző dolgozza fel. Az inputnak nincs `name` attribútuma,
így natív beküldésnél nem kerül bele semmi.

| | Böngésző (`main.js`, 10/c.) | Szerver (`api/lead.js`) |
|---|---|---|
| Darabszám | legfeljebb 6 | legfeljebb 6 |
| Keret | összesen 3 MB (feldolgozás után) | összesen 3,2 MB (ráhagyás) |
| Kép | bármilyen, amit a böngésző meg tud nyitni → **JPEG, max. 2000 px**, 0,82 minőség | csak JPEG, a fájl első bájtjai alapján |
| PDF | változatlanul, ha belefér a keretbe | csak PDF, a `%PDF-` fejléc alapján |
| Egyéb (docx, zip…) | elutasítva, üzenettel | elutasítva |

Miért ilyen szűk: a Vercel-függvény legfeljebb **4,5 MB**-os kérést fogad,
a base64-kódolás pedig +33%. Egy mai telefonfotó nyersen 3–8 MB lenne,
kicsinyítve jellemzően 300–800 kB, így 3 MB-ba 4–6 fotó fér.

A kicsinyítés a képek **metaadatait is eltávolítja** (GPS-hely, készülék).
PDF-nél ez nem történik meg.

Formátum a JSON-ban:

```json
"fajlok": [
  { "nev": "nappali.jpg", "tipus": "image/jpeg", "tartalom": "<base64>" },
  { "nev": "alaprajz.pdf", "tipus": "application/pdf", "tartalom": "<base64>" }
]
```

A szerver a fájlnevet megtisztítja, a kiterjesztést a tényleges tartalom
alapján adja, és a fájlokat **e-mail-mellékletként** küldi tovább
(Resend `attachments`). A weboldal sehol nem tárol fájlt. Ha bármelyik
fájl hibás, a teljes beküldés 422-vel visszautasul, és a látogató
üzenetet kap — levél ilyenkor nem megy ki.

**Nagyobb tervrajz** (több MB-os PDF) ezen az úton nem fér be. A
látogató ilyenkor azt az üzenetet kapja, hogy fotózza le, vagy küldje
e-mailben. Ha ez a gyakorlatban sok leadnél gond, a következő lépés a
közvetlen tárhelyre töltés (pl. Vercel Blob) — az viszont új
adatfeldolgozót, tárolást és törlési rendet jelent.

