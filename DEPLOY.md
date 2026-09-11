# Üzemeltetés — LupaTherm

Az **Emergent csak hosting**. A kód forrása ez a GitHub-repó, és minden
módosítás **itt, Claude Code-ban** történik. Emergentben soha ne szerkeszd
a fájlokat — ha ott is módosítasz, a két változat szétválik, és a következő
pusholás felülírja az ottani munkát.

## A munkamenet

1. Megírod, mit szeretnél változtatni (itt, a chatben).
2. A módosítás a `main` ágra kerül, feltolva GitHubra.
3. Emergentben frissítesz a repóból (pull / re-deploy).

Nincs build lépés, nincs függőség. Ami a repóban van, az megy ki 1:1.

## Fájlszerkezet

```
index.html          a teljes főoldal (a jogi dokumentumok is ebben vannak,
                    panelként: #impresszum, #adatkezelesi-tajekoztato,
                    #suti-szabalyzat)
404.html            hibaoldal
robots.txt          keresőrobot-szabályok
sitemap.xml         oldaltérkép
assets/css/         styles.css — minden stílus, egy fájlban
assets/js/          main.js — minden interakció, egy fájlban
assets/img/         fotók, ikonok, megosztási kép (README.md írja le, mi micsoda)
URLAP.md            az űrlap mezőnevei a CRM-/e-mail-sablonhoz
```

## ÉLESÍTÉSI TEENDŐK

Ezek nélkül az oldal működik, de nem található meg és nem gyűjt leadet.

### 1. Domain beírása — 4 hely, egy find-replace

Cseréld a `https://[DOMAIN]` szövegrészt a valódi címre:

- `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image`
- `sitemap.xml` — `<loc>`
- `robots.txt` — `Sitemap:` sor (a kikommentelt blokkban)

### 2. Indexelés engedélyezése

- `index.html`: töröld a `<meta name="robots" content="noindex, nofollow">` sort
- `robots.txt`: töröld a `Disallow: /` sort, és vedd ki a kommentből az alsó blokkot
- A `404.html` `noindex` sora **maradjon** — hibaoldal ne kerüljön keresőbe

### 3. Űrlap bekötése

Jelenleg **egyik űrlap sem küld adatot sehova** — az `assets/js/main.js`
10. blokkja csak egy demó üzenetet ír ki. A mezőnevek az `URLAP.md`-ben.
Bekötés után teszteld mindkét űrlapot (hero alatti és záró szekció).

### 4. Hiányzó tartalom

- `assets/img/logo.svg` — a valódi logó helye. Amíg nincs ott, a fejlécben
  és a láblécben egy tartalék jel látszik. A fájl bemásolása elég,
  kódmódosítás nem kell.
- `[TELEPÜLÉS]` — a 8 referenciakártyán, `index.html` `#referenciak`
- `[SZOLGÁLTATÁSI TERÜLET]` — felső sáv és lábléc
- `[HATÁLYBALÉPÉS DÁTUMA]` — mindhárom jogi dokumentumban
- `[TÁRHELYSZOLGÁLTATÓ ...]` — impresszum, 02. szakasz (Emergent adatai)
- `[ŰRLAP- VAGY CRM-SZOLGÁLTATÓ ...]` — adatkezelési tájékoztató, 07. szakasz

### 5. Süti szabályzat frissítése analitika bevezetésekor

A süti szabályzat jelenleg **kimondja, hogy az oldal nem használ saját
statisztikai, hirdetési vagy kampánykövető sütit** — mert tényleg nem.
Ha bekerül Google Analytics, Meta Pixel vagy hasonló, azt **fel kell venni
a 03. szakaszba**, és **sütikezelő sávot kell működtetni a bevezetés előtt**.
Enélkül a szabályzat valótlan állítást tartalmazna.

## Amit ne csinálj

- Ne szerkeszd a fájlokat Emergentben.
- Ne nevezd át a fájlokat/mappákat — a hivatkozások relatív útvonalak.
- Ne töröld az `assets/img/README.md`-t, az írja le, melyik fotó hova tartozik.
