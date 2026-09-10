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
| `svc-nyilaszaro.jpg` | 01 · Nyílászáró beépítés | hosszú házhomlokzat új fehér műanyag ablakokkal és ajtóval |
| `svc-ajto.jpg` | 02 · Bejárati ajtók | aranytölgy dekorfóliás bejárati ajtó keskeny üvegbetétekkel |
| `svc-redony.jpg` | 03 · Árnyékolástechnika | antracit zsalúzia egy nagy terasznyílás előtt |
| `svc-szunyoghalo.jpg` | 04 · Komplett megoldások | nyíló szúnyoghálós ajtó bejárati ajtón |

Feltöltéskor a hosszabbik oldal 1400 px, JPEG ~82% minőség. A kártyán
`object-fit: cover` vág, tehát nem kell előre vágni.

## Referenciafotók

A galéria **8 kártyából** áll (a lapozó tetszőleges elemszámot kezel).
A fájlok már a helyükön vannak, átméretezve (hosszabbik oldal 1400 px, JPEG 82%).

| Fájl | Kategória a kártyán | Mi látszik |
|---|---|---|
| `ref-01.jpg` | Ablakbeépítés | négy fehér műanyag ablak klinkerburkolatos homlokzaton |
| `ref-02.jpg` | Bejárati ajtó | fehér ajtó két oldalvilágítóval és felülvilágítóval |
| `ref-03.jpg` | Ablak és redőny | fehér ablak ráépített redőnytokkal |
| `ref-04.jpg` | Bejárati ajtó | fehér ajtó két íves üvegbetéttel |
| `ref-05.jpg` | Komplett megoldás | sötét tölgy ablak redőnnyel és szúnyoghálóval |
| `ref-06.jpg` | Bejárati ajtó | fehér ajtó oldalvilágítóval, belülről |
| `ref-07.jpg` | Belső párkány | sötét fahatású belső ablakpárkány |
| `ref-08.jpg` | Bejárati ajtó | ajtó felülvilágítóval, beépítés közben |

A sorrend szándékosan váltakozik (ablak / ajtó / kiegészítő), hogy ne jöjjön több
ajtó egymás után. A kategóriacímke minden kártyán ahhoz igazodik, ami a fotón
ténylegesen látszik.

A kártyán `object-fit: cover` vág **4:5** arányban — ez a leggyakoribb álló
tájolású fotókból vág a legkevesebbet. A lightboxban `object-fit: contain`,
tehát ott a teljes kép látszik.

**A települések `[TELEPÜLÉS]` helykitöltők**, és a leírásokat abból írtam,
ami a fotókon látszik. Érdemes átnézni és pontosítani őket az `index.html`
`#referenciak` szekciójában.
