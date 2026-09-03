# [CÉGNÉV] — landingoldal (redőny, szúnyogháló, nyílászárócsere)

Leadgenerálásra optimalizált, egyoldalas landing **dizájnváz** fehér alapon,
barack–terrakotta színvilágban, építőipari–műszaki rajz vizuális nyelven.

> **Állapot:** a szövegezés elkészült. Ami **szögletes zárójelben** maradt, az
> kizárólag cégadat, fotó vagy konkrét referenciaadat — ezeket nem találjuk ki.

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

A rendszer két megadott alapszínre épül; minden más ezekből származik.
Az oldal szándékosan egyetlen, világos témára készült (`color-scheme: light`).

### A két alapszín

| Változó | Érték | Szerep |
|---|---|---|
| `--peach` | `#F0BE99` | **megadott** — felületek, sraffozás-alap, jelzősáv, háttérfények |
| `--terra` | `#CA643E` | **megadott** — vonalak, méretjelek, ikonok, keretek, nagy kiemelés |

### Származtatott terrakotta árnyalatok

`#CA643E` fehéren 3,89:1 — ez grafikára és nagy szövegre elég, kis szövegre nem.
Ezért a szöveget hordozó felületekhez két sötétebb testvér készült:

| Változó | Érték | Kontraszt fehérrel | Szerep |
|---|---|---|---|
| `--terra-mid` | `#B85433` | 4,82:1 | CTA-gomb felső sávja, kis akcentszöveg |
| `--terra-deep` | `#7E3419` | 8,78:1 | CTA-gomb alsó sávja, hoverállapot |

### Felületek és tinta

| Változó | Érték | Szerep |
|---|---|---|
| `--bg-1` | `#FFFFFF` | elsődleges háttér — tiszta fehér |
| `--bg-2` | `#FDF1E8` | másodlagos háttér — halvány barack |
| `--card` / `--card-2` | `#FFFFFF` / `#FEF6F0` | kártyák, emelt kártyák |
| `--tint` / `--tint-2` | `#FDF4EE` / `#F9E5D6` | barack wash felületek |
| `--kraft` / `--kraft-2` | `#FBEADC` / `--peach` | fa és falazat sraffozás alapja, jelzősáv |
| `--concrete` / `--concrete-2` | `#F2EFEA` / `#E5E0D8` | beton és acél sraffozás — semleges anyagcsalád |
| `--ink` | `#2E211B` | elsődleges szöveg, műszaki adatsáv |
| `--text-muted` | `#7A6357` | másodlagos szöveg |
| `--border` | `#EEDCCD` | keretek és elválasztók |
| `--hatch-ink` | `rgba(202,100,62,.32)` | sraffozás vonalszíne |

A `--brown*` nevek megmaradtak aliasként, hogy a meglévő szabályok ne törjenek;
értékük a fenti terrakotta skálára mutat.

Minden szövegszín/háttér páros eléri a WCAG AA szintet (legkisebb mért érték: 4,8:1).

## Tipográfia

- Főcímek: **Archivo** (`--font-display`) — 500-as súly a nagy címeknél,
  600 a kártyacímeknél; **mondatkezdő nagybetűs**, nem csupa nagybetűs
- Törzsszöveg és kezelőfelület: **Inter** (`--font-body`)
- Műszaki annotáció: **IBM Plex Mono** (`--font-mono`) — méretek, rajzszámok,
  tételkódok, fejbélyeg-cellák

Mindhárom a Google Fontsról töltődik be az `index.html` `<head>` részében.
Az Archivo `latin-ext` készlete lefedi a magyar ékezeteket (Ő, Ű is).

A csupa nagybetűs szedés a **kis műszaki címkéken** maradt meg
(`.eyebrow`, `.eyebrow__idx`, `.footer__title`, gombok, mezőcímkék) — ott
jelzésértéke van; a címsorokon a lazább, mondatkezdő nagybetűs szedés fut.

## Hero videó

A hero rajzlapján a beágyazott Facebook Reel fut, a hivatalos
`facebook.com/plugins/video.php` beágyazón keresztül, 9:16 arányú keretben.

- A lejátszó mögött **tartalék réteg** ül (`.fbvideo__fallback`): ha a
  beágyazás nem tölthető be — nem nyilvános videó, tartalomvédelmi szabály
  vagy a beágyazást tiltó CSP —, üres keret helyett ez marad látható.
- A keret alatt mindig kattintható marad a **„Megnyitás a Facebookon"** link.
- A beágyazás harmadik féltől (Facebook) tölt be tartalmat és sütiket
  helyezhet el — ezt érdemes átvezetni az adatkezelési tájékoztatón, illetve
  sütikezelő mögé tenni, ha az oldalon lesz ilyen.

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

## Szövegezés

A landing szövege a megkapott anyagból készült, a **meglévő szerkezethez igazítva**.

### Mi került hova

| Szekció | Forrásanyag |
|---|---|
| Hero | „Redőny, szúnyogháló vagy ablakcsere?" + a bevezető bekezdés |
| Előnysáv (4 kártya) | „Egyszerű és átlátható folyamat" négy pontja |
| SZ—02 Ajánlatkérés | „Ne neked kelljen pontosan tudnod, mire van szükséged" |
| SZ—03 Mikor érdemes | „Mikor érdemes foglalkozni a cserével?" — 5 pont 3 kártyába vonva |
| SZ—04 Megoldások | a négy szolgáltatás 1:1-ben |
| SZ—04 záró blokk | „Mennyibe kerül…?" üzenete egy mondatba sűrítve |
| SZ—05 Referenciák | „Korábbi munkáink" + a `[Település] – [munka]` felirat-minta |
| SZ—06 Folyamat | a négylépéses ajánlatkérési folyamat |
| SZ—07 Záró CTA | „Indítsd el otthonod korszerűsítését…" |
| Footer | tagline, kapcsolat, jogi linkek |
| `<title>` / meta | a megadott SEO-adatok |

A hero rajzlap fejbélyege a négy megoldás legendájává vált, a lapszám (`01 / 04`)
pedig a négylépéses folyamatra utal.

### Ami nem fért be a jelenlegi szerkezetbe

Ezekhez új szekció vagy új űrlapmező kellene:

1. **Gyakori kérdések (6 db)** — nincs FAQ-szekció az oldalon. A legfontosabb
   három állítás beépült a bizalmi listába, a garanciasávba és a hero
   mikroszövegébe, a többi kimaradt.
2. **Külön árazási szekció** — az üzenete a szolgáltatások záró blokkjában van,
   a felsorolás (darabszám, méret, kivitel, helyszín…) nem.
3. **Extra űrlapmezők** — a javasolt *Település*, *Darabszám*, *Méretek*,
   *Időpont* és *Fotófeltöltés* mezők nincsenek az űrlapokon; ezek most a
   szövegmező helykitöltőjében szerepelnek kérdésként.
4. **Sikeres beküldés üzenete** — az `index.html` végén HTML-kommentben vár a
   bekötésre. Amíg az űrlap nincs bekötve, a JS szándékosan azt írja ki, hogy a
   beküldés még nem működik — nem jelenítünk meg valótlan visszaigazolást.

### Ami helykitöltő maradt

`[CÉGNÉV]`, `[TELEFONSZÁM]`, `[E-MAIL-CÍM]`, `[SZOLGÁLTATÁSI TERÜLET]`, `[ÉV]`,
`[RÖVID CÉGBEMUTATÓ]`, a referenciák adatai (`[TELEPÜLÉS]`, `[AZ ELVÉGZETT MUNKA]`,
`[RÖVID LEÍRÁS A MUNKÁRÓL]`, `[BEÉPÍTETT MEGOLDÁS]`) és a képhelyek
(`[REFERENCIAFOTÓ 01–04]`, `[KIEMELT KÉP VAGY VIDEÓ HELYE]`, `[IKON VAGY KÉP HELYE]`).

A `<meta name="robots" content="noindex, nofollow">` szándékosan bent maradt,
amíg a cégadatok nincsenek kitöltve.

## Tartalom beillesztése

1. Keresd a `[` … `]` mintát az `index.html`-ben — minden találat egy kitöltendő hely.
2. A kiemelést a `<span class="hl">` osztály adja (terrakotta gradiens).
3. A kép-helykitöltők (`.visual__stage`, `.service__media`, `.ref__media`,
   `.lightbox__media`) sraffozott blokkok — cserélhetők valódi `<img>` vagy `<video>` elemre.
4. Az űrlapok jelenleg **nem küldenek adatot**: a `main.js` `10.` blokkja csak
   egy visszajelzést jelenít meg. Valós bekötéskor ezt kell cserélni
   (`form action` vagy `fetch`), és ott használandó a fájl végén kommentben
   elhelyezett sikerüzenet.

## Reszponzív viselkedés

- Töréspontok: `1100px` (kisebb asztali), `900px` (tablet / mobil menü), `640px` (mobil), `360px`.
- Mobilon egyoszlopos elrendezés, teljes szélességű CTA-gombok, min. 48–52 px magas
  űrlapmezők, 16 px betűméret a mezőkben (nincs iOS-zoom), függőleges idővonal,
  ragadós alsó CTA sáv.
- A meleg háttérfények mobilon csökkentett erősséggel jelennek meg az olvashatóság miatt.
- Nincs vízszintes görgetés egyik nézetben sem.
- `prefers-reduced-motion` esetén az animációk kikapcsolnak.
