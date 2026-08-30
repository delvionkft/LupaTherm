# [PROJEKT NEVE] — prémium landingoldal-váz

Leadgenerálásra optimalizált, egyoldalas landing **dizájnváz** mély bordó, borvörös,
fekete és sötét grafitszürke stílusban.

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
| – | Fejléc (ragadós, görgetésre blur + bordó alsó keret) | `#header` |
| 1 | Hero + social proof sáv | `#hero` |
| 2 | Első ajánlatkérő blokk (kétoszlopos, sötét űrlapkártya) | `#ajanlatkeres` |
| 3 | Probléma / fő előnyök (3 kártya) | `#problemak` |
| 4 | Megoldás és szolgáltatások (moduláris grid, 4 kártya) | `#szolgaltatasok` |
| 5 | Referenciák (lapozható galéria + lightbox) | `#referenciak` |
| 6 | Folyamat (idővonal, görgetésre töltődő borvörös vonal) | `#folyamat` |
| 7 | Záró ajánlat + űrlap | `#kapcsolat` |
| 8 | Footer (háttérben halvány cégnév-vízjel) | `.footer` |

## Színpaletta

A színek CSS-változóként érhetők el a `:root` blokkban (`assets/css/styles.css`).

| Változó | Érték | Szerep |
|---|---|---|
| `--bg-1` | `#080607` | elsődleges háttér |
| `--bg-2` | `#11090B` | másodlagos háttér |
| `--card` | `#1A0D11` | kártyák háttere |
| `--card-2` | `#211015` | emelt kártyák háttere |
| `--wine-deep` | `#4A0D18` | mély borvörös |
| `--wine` | `#741827` | elsődleges bordó |
| `--wine-light` | `#9B2638` | világosabb vöröses kiemelés |
| `--wine-hover` | `#B23A4B` | hover kiemelés |
| `--text` | `#F4EFF0` | elsődleges szövegszín |
| `--text-muted` | `#B8A6AA` | másodlagos szövegszín |
| `--border` | `#382128` | keretek és elválasztók |

## Tipográfia

- Főcímek: **Bebas Neue** (`--font-display`)
- Törzsszöveg és kezelőfelület: **Inter** (`--font-body`)

Mindkettő Google Fontsról töltődik be az `index.html` `<head>` részében.

## Tartalom beillesztése

1. Keresd a `[` … `]` mintát az `index.html`-ben — minden találat egy kitöltendő hely.
2. A kiemelést a `<span class="hl">` osztály adja (mély bordó → világosabb borvörös gradiens).
3. A kép-helykitöltők (`.visual__stage`, `.service__media`, `.ref__media`,
   `.lightbox__media`) sötét blokkok — ezek cserélhetők valódi `<img>` vagy `<video>` elemre.
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
- A bordó háttérfények mobilon csökkentett erősséggel jelennek meg az olvashatóság miatt.
- Nincs vízszintes görgetés egyik nézetben sem.
- `prefers-reduced-motion` esetén az animációk kikapcsolnak.
