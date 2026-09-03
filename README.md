# [CÉGNÉV] — landingoldal (redőny, szúnyogháló, nyílászárócsere)

Leadgenerálásra optimalizált, egyoldalas landing **dizájnváz** fehér alapon,
egyetlen akcentszínnel, építőipari–műszaki rajz vizuális nyelven.

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
assets/img/           – referenciafotók helye (ref-01.jpg … ref-05.jpg);
                        a mappa README-je leírja, melyik fájl hova kerül
```

## Szekciók

| # | Szekció | Azonosító |
|---|---------|-----------|
| – | Fejléc (ragadós, görgetésre blur + akcent alsó keret) | `#header` |
| 1 | Hero + social proof sáv | `#hero` |
| 2 | Első ajánlatkérő blokk (kétoszlopos, űrlapkártya) | `#ajanlatkeres` |
| 3 | Probléma / fő előnyök (3 kártya) | `#problemak` |
| 4 | Megoldás és szolgáltatások (moduláris grid, 4 kártya) | `#szolgaltatasok` |
| 5 | Referenciák (lapozható galéria + lightbox) | `#referenciak` |
| 6 | Folyamat (idővonal, görgetésre töltődő akcentvonal) | `#folyamat` |
| 7 | Záró ajánlat + űrlap | `#kapcsolat` |
| 8 | Footer (háttérben halvány cégnév-vízjel) | `.footer` |

## Színpaletta

Egyszerű fehér alap, **egyetlen** akcentszín. Minden más semleges.

| Változó | Érték | Szerep |
|---|---|---|
| `--accent` | `#CA4E23` | **megadott** — gombok, vonalak, méretjelek, ikonok, kiemelés |
| `--accent-dark` | `#A33C17` | hoverállapot |
| `--accent-50` | `#FDF4F0` | leheletnyi akcentfelület |
| `--accent-100` | `#F7DFD4` | halvány akcentfelület, keret |
| `--bg-1` | `#FFFFFF` | elsődleges háttér |
| `--n-50` | `#FAFAF9` | másodlagos sáv, emelt kártya |
| `--n-100` | `#F4F4F2` | sraffozott felület alapja |
| `--n-200` | `#E9E8E5` | keretek, elválasztók |
| `--n-300` | `#DAD9D5` | erősebb él |
| `--ink` | `#1C1B1A` | elsődleges szöveg, műszaki adatsáv |
| `--ink-muted` | `#6B6A66` | másodlagos szöveg |

`#CA4E23` fehéren **4,54:1** — eléri a WCAG AA szintet normál szövegre is,
ezért a CTA-gombok a **pontos megadott árnyalatot** viselik fehér felirattal,
származtatott sötétítés nélkül; a gombok laposak, gradiens nélkül.
A hoverállapot `--accent-dark` (6,5:1).

Az anyagsraffozások vonalszíne semleges (`rgba(28,27,26,.14)`), a háttérfények
alig láthatóak — így a szín egyetlen helyen dolgozik: az akcentelemeken.

A régi `--brown*` / `--terra*` / `--peach` nevek aliasként megmaradtak.

## Kapcsolati adatok

Az oldalon végig kattinthatóak (`tel:` és `mailto:`):

| Adat | Hol jelenik meg |
|---|---|
| `+36 30 113 1261` | fejléc adatsáv, hero másodlagos CTA, SZ—02, SZ—07, footer, mobil sáv |
| `+36 30 530 7556` | SZ—02, SZ—07, footer |
| `polanyiablak@gmail.com` | SZ—02, SZ—07, footer |

**A cégnév szándékosan `[CÉGNÉV]` maradt.** Az e-mail-címből kikövetkeztethető
lenne, de a `<title>`-ben, a logóban, a footerben és a copyrightban is megjelenik
— ezt nem tippeljük meg. Kell hozzá a pontos márkanév (és ha eltér, a bejegyzett
cégnév a jogi oldalakhoz).

## Tipográfia

**Egyetlen betűcsalád az egész oldalon: Inter.** A `--font-display`, a
`--font-body` és a `--font-mono` mind ugyanarra a stackre mutat.

- Címsorok: 500-as súly a nagy címeknél, 600 a kártyacímeknél, mondatkezdő
  nagybetűs szedéssel
- Törzsszöveg: 400
- Műszaki címkék (méretvonal, rajzszám, fejbélyeg, tételkód): 600, csupa
  nagybetűs, ritkított, `font-variant-numeric: tabular-nums`

A technikai jelleget nem külön betűtípus adja, hanem a szedés — ezért maradt
egyszerű az oldal.

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

## Referenciafotók

A galéria **5 kártyából** áll, mindegyik egy fotóra hivatkozik:
`assets/img/ref-01.jpg` … `ref-05.jpg`. Jelenleg **generált helykitöltő
JPEG-ek** vannak a helyükön — a valódi fotókat elég felülírni velük, az
`index.html`-ben nincs teendő. A hozzárendelést az `assets/img/README.md`
tartalmazza.

Hiányzó vagy hibás fájl esetén az oldal nem törik el: a `main.js` elrejti a
képet, és a sraffozott panel marad a helyén.

- Kártyán: `object-fit: cover`, 4:3 vágás
- Lightboxban: `object-fit: contain`, a teljes kép látszik
- `loading="lazy"` és `decoding="async"` mindkét helyen

A címeket és leírásokat abból írtam, ami a fotókon **látszik**; a település
mindenhol `[TELEPÜLÉS]` helykitöltő. Érdemes átnézni és pontosítani őket.

## Vizuális nyelv

A szekció az építőipar saját szakmai vernakulárisából épül, nem ikonokból:

| Eszköz | Hol | Mit kódol |
|---|---|---|
| Rajzlap-hivatkozás (`SZ—01` … `SZ—07`) | szekciócímkék | a szekció valódi sorszáma |
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

`[CÉGNÉV]`, `[SZOLGÁLTATÁSI TERÜLET]`, `[ÉV]`,
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
