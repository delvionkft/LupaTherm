# Képek

## Logó

`logo.svg` — a **valódi LupaTherm logó** helye. Amíg nincs itt, a fejlécben és
a láblécben egy egyszerű, arculatba illő tartalék jel látszik (három sávos
elem a logó három tónusában). A fájl bemásolásával automatikusan átveszi a
helyét, kódmódosítás nélkül.

- Ajánlott: **SVG** (élesen skálázódik), 1:1 arányú vágás
- Ha csak PNG van: 120×120 px, átlátszó háttér, és az `index.html`-ben írd át
  a kiterjesztést `logo.svg`-ről `logo.png`-re (két helyen)

## Szolgáltatásfotók

A megoldások szekció kártyáinak képei:

| Fájlnév | Kártya | Mi látszik |
|---|---|---|
| `svc-nyilaszaro.jpg` | 01 · Ablak- és nyílászárócsere | családi ház homlokzata új fehér nyílászárókkal |
| `svc-redony.jpg` | 02 · Redőnyök | antracit árnyékoló egy nagy terasznyílás előtt |
| `svc-szunyoghalo.jpg` | 03 · Szúnyoghálók | nyíló szúnyogháló-ajtó bejárati ajtón |
| `svc-parkany.jpg` | 04 · Komplett megoldások | beépített fa ablakpárkány — a párkány kiegészítőként a kártya leírásában szerepel |

Feltöltéskor a hosszabbik oldal 1400 px, JPEG ~82% minőség. A kártyán
`object-fit: cover` vág, tehát nem kell előre vágni.

## Referenciafotók

A galéria **8 kártyából** áll (a lapozó tetszőleges elemszámot kezel).
A fájlok már a helyükön vannak, átméretezve (hosszabbik oldal 1400 px, JPEG 82%).

| Fájl | Eredeti | Mi látszik |
|---|---|---|
| `ref-01.jpg` | IMG_5588-1 | klinkerburkolatos homlokzat új fehér ablaksorral |
| `ref-02.jpg` | IMG_5940 | aranytölgy bejárati ajtó oldalvilágítóval |
| `ref-03.jpg` | IMG_5007 | két fehér ablak ráépített redőnnyel |
| `ref-04.jpg` | IMG_6879 | fehér bejárati ajtó oldal- és felülvilágítóval |
| `ref-05.jpg` | IMG_3101 | sötét tölgy ablak redőnnyel és szúnyoghálóval |
| `ref-06.jpg` | IMG_4456 | fehér bejárati ajtó íves üvegbetétekkel |
| `ref-07.jpg` | IMG_5939 | fehér bejárati ajtó oldalvilágítóval, belülről |
| `ref-08.jpg` | IMG_4348 | bejárati ajtó a beépítés fázisában |

A sorrend szándékosan váltakozik (ablak / ajtó), hogy ne öt ajtó jöjjön egymás után.

A kártyán `object-fit: cover` vág **4:5** arányban — ez a leggyakoribb álló
tájolású fotókból vág a legkevesebbet. A lightboxban `object-fit: contain`,
tehát ott a teljes kép látszik.

**A települések `[TELEPÜLÉS]` helykitöltők**, és a leírásokat abból írtam,
ami a fotókon látszik. Érdemes átnézni és pontosítani őket az `index.html`
`#referenciak` szekciójában.
