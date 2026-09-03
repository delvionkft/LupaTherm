# Képek

## Logó

`logo.svg` — a **valódi LupaTherm logó** helye. Amíg nincs itt, a fejlécben és
a láblécben egy egyszerű, arculatba illő tartalék jel látszik (három sávos
elem a logó három tónusában). A fájl bemásolásával automatikusan átveszi a
helyét, kódmódosítás nélkül.

- Ajánlott: **SVG** (élesen skálázódik), 1:1 arányú vágás
- Ha csak PNG van: 120×120 px, átlátszó háttér, és az `index.html`-ben írd át
  a kiterjesztést `logo.svg`-ről `logo.png`-re (két helyen)

## Referenciafotók

Másold ide az 5 fotót **pontosan ezekkel a nevekkel** — az `index.html` már
ezekre hivatkozik, más teendő nincs.

| Fájlnév | Melyik fotó | Az oldalon megjelenő cím |
|---|---|---|
| `ref-01.jpg` | belső nézet, háromrészes fehér ablak védőfóliával, zöld kerítés a háttérben | [TELEPÜLÉS] – Háromrészes ablak beépítése |
| `ref-02.jpg` | homlokzat, két új fehér nyílászáró a régi vakolatban, terrakotta terasz | [TELEPÜLÉS] – Homlokzati ablak- és ajtócsere |
| `ref-03.jpg` | panellakás erkélyajtaja és ablaka, lakótelepi kilátással | [TELEPÜLÉS] – Erkélyajtó és ablak cseréje |
| `ref-04.jpg` | elkészült családi ház, faerezetű nyílászárók, kőhatású kávaburkolat | [TELEPÜLÉS] – Faerezetű nyílászárók családi házon |
| `ref-05.jpg` | nagyméretű kétszárnyú teraszajtó, kőburkolatos fal, pergola | [TELEPÜLÉS] – Nagyméretű teraszajtó |

## Ajánlott formátum

- **Méret:** hosszabbik oldal kb. **1600 px** (a kártya 400 px-en, a lightbox
  1080 px-en jeleníti meg — 1600 px mindkettőre bőven elég)
- **Formátum:** JPEG, ~78–82% minőség, fájlonként kb. **150–300 KB**
- **Arány:** a kártyán 4:3-ra vág (`object-fit: cover`), a lightboxban
  teljes egészében látszik (`object-fit: contain`) — nem kell előre vágni

Parancssorból, ha van ImageMagick:

```bash
magick eredeti.jpg -auto-orient -resize 1600x1600\> -quality 80 -strip ref-01.jpg
```

## Jelenlegi állapot: placeholder képek

A mappában most **generált helykitöltő JPEG-ek** vannak, ugyanezekkel a nevekkel.
A valódi fotókat egyszerűen **írd felül** velük — az `index.html`-ben nincs
teendő.

Ha egy fájl hiányzik vagy hibás, az oldal akkor sem törik el: a `main.js`
elrejti a be nem töltődő képet, és a sraffozott panel marad a helyén.

A helykitöltők újragenerálhatók: a generátor a fejlesztői jegyzetek között
maradt, de egyszerűbb egyszerűen felülírni őket a valódi fotókkal.

## Ellenőrizd a feliratokat

A címeket és leírásokat abból írtam, ami a fotókon **látszik** — a település
mindenhol `[TELEPÜLÉS]` helykitöltő maradt. Nézd át és pontosítsd őket az
`index.html` `#referenciak` szekciójában.
