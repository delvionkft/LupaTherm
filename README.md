# [PROJEKT NEVE] — prémium landingoldal-váz

Leadgenerálásra optimalizált, egyoldalas landing **dizájnváz** fehér alapon,
barna árnyalatokkal, építőipari–műszaki rajz vizuális nyelven.

> **Fontos:** az oldal jelenleg **nem tartalmaz valódi tartalmat**. Minden címsor,
> bekezdés, CTA, adat, referencia és szolgáltatás **szögletes zárójeles helykitöltő**
> (pl. `[FŐCÍM HELYKITÖLTŐ SZÖVEG]`). A cél kizárólag a szerkezet, a vizuális irány
> és a felhasználói élmény bemutatása.

## Futtatás

Nincs build lépés, sem függőség — statikus HTML/CSS/JS.

```bash
# bármely statikus szerver, pl.
npx http-server . -p 8080
# vagy egyszerűen nyisd meg az index.html fájlt böngészőben
```

## Fájlszerkezet

```
index.html            – teljes oldalszerkezet (fejléc → 7 szekció → footer)
assets/css/styles.css – design tokenek, komponensek, szekciók, reszponzív szabályok
assets/js/main.js     – fejléc állapot, mobil menü, reveal, parallax,
                        carousel, lightbox, idővonal-töltés, űrlap demó
```

## Szekciók

| # | Szekció | Azonosító |
|---|---------|-----------|
| – | Fejléc (ragadós, görgetésre blur + barna alsó keret) | `#header` |
| 1 | Hero + social proof sáv | `#hero` |
| 2 | Első ajánlatkérő blokk (kétoszlopos, sötét űrlapkártya) | `#ajanlatkeres` |
| 3 | Probléma / fő előnyök (3 kártya) | `#problemak` |
| 4 | Megoldás és szolgáltatások (moduláris grid, 4 kártya) | `#szolgaltatasok` |
| 5 | Referenciák (lapozható galéria + lightbox) | `#referenciak` |
| 6 | Folyamat (idővonal, görgetésre töltődő barna vonal) | `#folyamat` |
| 7 | Záró ajánlat + űrlap | `#kapcsolat` |
| 8 | Footer (háttérben halvány barna cégnév-vízjel) | `.footer` |

## Színpaletta

A színek CSS-változóként érhetők el a `:root` blokkban (`assets/css/styles.css`).
Az oldal szándékosan egyetlen, világos témára készült (`color-scheme: light`).

| Változó | Érték | Szerep |
|---|---|---|
| `--bg-1` | `#FFFFFF` | elsődleges háttér — tiszta fehér |
| `--bg-2` | `#F7F2EB` | másodlagos háttér — meleg homok |
| `--card` | `#FFFFFF` | kártyák háttere |
| `--card-2` | `#FBF7F1` | emelt kártyák háttere |
| `--brown-deep` | `#33210F` | mély barna (espresso) |
| `--brown` | `#6B4423` | elsődleges barna |
| `--brown-light` | `#8A5A31` | világosabb barna kiemelés |
| `--brown-hover` | `#4A2E17` | hover — világos alapon sötétebb |
| `--tint` | `#F2E9DC` | halvány barna felület |
| `--tint-2` | `#E8DAC7` | erősebb halvány barna felület |
| `--text` | `#2A1C11` | elsődleges szövegszín |
| `--text-muted` | `#7A6959` | másodlagos szövegszín |
| `--on-brown` | `#FDF9F4` | szöveg barna felületen |
| `--border` | `#E0D3C2` | keretek és elválasztók |
| `--graphite` | `#2B2926` | acél / szerkezeti elem, műszaki felirat |
| `--concrete` | `#F1F0EC` | beton — hideg világos sáv |
| `--concrete-2` | `#E4E2DB` | beton él, vonalzó osztás |
| `--kraft` | `#EFE3D0` | fa / kraft felület |
| `--kraft-2` | `#DCC7A8` | fa él |

A meleg homok tónus szándékosan csak a váltakozó szekciósávokon, a kép-helykitöltőkön
és a lezáró CTA blokkon jelenik meg — a tartalmi felületek fehérek maradnak.
Minden szövegszín/háttér páros eléri a WCAG AA szintet (legkisebb mért érték: 4,7:1).

## Tipográfia

- Főcímek: **Anton** (`--font-display`) — nehéz, táblaszerű kondenzált sans
- Törzsszöveg és kezelőfelület: **Inter** (`--font-body`)
- Műszaki annotáció: **IBM Plex Mono** (`--font-mono`) — méretek, rajzszámok,
  tételkódok, fejbélyeg-cellák

Mindhárom a Google Fontsról töltődik be az `index.html` `<head>` részében.
Az Anton `latin-ext` készlete lefedi a magyar ékezeteket (Ő, Ű is).

## Vizuális nyelv

A szekció az építőipar saját szakmai vernakulárisából épül, nem ikonokból:

| Eszköz | Hol | Mit kódol |
|---|---|---|
| Rajzlap-hivatkozás (`SZ—01` … `SZ—07`) | szekciócímkék | a szekció valódi sorszáma |
| Méretvonal (`.dimline`) | hero | mutatószám kiemelése |
| Fejbélyeg / title block (`.titleblock`) | hero vizuál | lépték, dátum, verzió, státusz |
| Illesztőjelek (`.cropmark`) | rajzlap sarkai | rajzlap-keretezés |
| Anyagsraffozások (`.hatch--*`) | kép-helykitöltők | beton, falazat, fa, acél, hőszigetelés |
| Léptékvonalzó (`.section::before`) | szekcióhatárok | vizuális váltás |
| Szintezőléc (`.timeline-wrap::before`) | folyamat | a lépések sorrendje és haladása |
| Figyelmeztető sáv (`.chevron-rail`) | záró CTA | a lezáró blokk kiemelése |
| Műszaki adatsáv (`.utilbar`, `.footer__spec`) | fejléc, footer | cégadatok helye |

A sarkok lekerekítése szándékosan 2–3 px (`--radius`), a geometria szögletes.

## Tartalom beillesztése

1. Keresd a `[` … `]` mintát az `index.html`-ben — minden találat egy kitöltendő hely.
2. A kiemelést a `<span class="hl">` osztály adja (világosabb barna → espresso gradiens).
3. A kép-helykitöltők (`.visual__stage`, `.service__media`, `.ref__media`,
   `.lightbox__media`) meleg homokszínű blokkok — ezek cserélhetők valódi `<img>` vagy `<video>` elemre.
4. Az űrlapok jelenleg **nem küldenek adatot**: a `main.js` `10.` blokkja csak
   egy helykitöltő visszajelzést jelenít meg. Valós bekötéskor ezt kell cserélni
   (`form action` vagy `fetch`).
5. A `<meta name="robots" content="noindex, nofollow">` szándékosan van bent,
   amíg a váz nem élesíthető.

## Reszponzív viselkedés

- Töréspontok: `1100px` (kisebb asztali), `900px` (tablet / mobil menü), `640px` (mobil), `360px`.
- Mobilon egyoszlopos elrendezés, teljes szélességű CTA-gombok, min. 48–52 px magas
  űrlapmezők, 16 px betűméret a mezőkben (nincs iOS-zoom), függőleges idővonal,
  ragadós alsó CTA sáv.
- A meleg háttérfények mobilon csökkentett erősséggel jelennek meg az olvashatóság miatt.
- Nincs vízszintes görgetés egyik nézetben sem.
- `prefers-reduced-motion` esetén az animációk kikapcsolnak.
