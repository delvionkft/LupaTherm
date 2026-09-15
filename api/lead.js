/**
 * POST /api/lead — ajánlatkérő űrlap feldolgozása
 *
 * Tervezési elvek:
 *  - A kliens SOHA nem adhat meg címzettet, tárgyat vagy sablont.
 *    Mindhárom szerveroldali konfigurációból jön.
 *  - Titkos kulcs kizárólag environment variable-ből olvasható, és
 *    soha nem kerül válaszba vagy naplóba.
 *  - Minden mező ellenőrzött és tisztított; a rádiós válaszok fix
 *    engedélyezőlistáról jöhetnek.
 *  - Kétféle beküldést fogad:
 *      application/json                  — fetch-es út (fut a JS)
 *      application/x-www-form-urlencoded — natív űrlapbeküldés (nincs JS)
 *    Az utóbbi miatt POST a metódus: így JS nélkül sem kerül személyes
 *    adat az URL query paramétereibe.
 */

/* ------------------------------------------------------------------ */
/* Konfiguráció                                                        */
/* ------------------------------------------------------------------ */

const MAX = { nev: 80, telefon: 32, email: 160, helyszin: 120, uzenet: 2000 };

const ENUMS = {
  ingatlan:  ['csaladi-haz', 'tarsashaz', 'egyeb'],
  darabszam: ['1-3', '4-8', '8-plusz'],
  igeny:     ['nyilaszaro', 'bejarati-ajto', 'arnyekolas', 'komplett'],
  idozites:  ['azonnal', '1-3-honap', 'tajekozodom'],
  forras:    ['hero-urlap', 'zaro-urlap']
};

const LABELS = {
  ingatlan:  { 'csaladi-haz': 'Családi ház', 'tarsashaz': 'Társasházi lakás', 'egyeb': 'Egyéb (iroda, üzlet)' },
  darabszam: { '1-3': '1–3 db', '4-8': '4–8 db', '8-plusz': '8 db felett' },
  igeny:     { 'nyilaszaro': 'Nyílászáró', 'bejarati-ajto': 'Bejárati ajtó',
               'arnyekolas': 'Árnyékolás (redőny, zsalúzia)', 'komplett': 'Komplett megoldás' },
  idozites:  { 'azonnal': 'Most azonnal', '1-3-honap': '1–3 hónapon belül', 'tajekozodom': 'Még csak tájékozódom' },
  forras:    { 'hero-urlap': 'Hero szekció űrlapja', 'zaro-urlap': 'Záró szekció űrlapja' }
};

const NINCS = 'nincs megadva';

/* Kérésszámlálás. FIGYELEM: a futtatókörnyezet példányonként külön
   memóriát használ, és hidegindításkor ürül — ez tehát torlaszolja a
   naiv ismétlést, de nem elosztott rate limit. Tartós korlátozáshoz
   külső tároló kell (Vercel KV / Upstash Redis). */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) { hits.set(ip, list); return true; }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Segédfüggvények                                                     */
/* ------------------------------------------------------------------ */

const CONTROL_CHARS = /[\p{Cc}\p{Cf}]/gu;

/** Egysoros mező: vezérlő- és formázókarakterek, sortörések kiszűrése.
    A sortörés eltávolítása fejlécinjektálás ellen is véd. */
function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(CONTROL_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** Több soros mező: a sortörés maradhat, a vezérlőkarakter nem. */
function cleanMultiline(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(CONTROL_CHARS, ' ').replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

function pickEnum(field, value) {
  return ENUMS[field].includes(value) ? value : '';
}

function label(field, value) {
  return value ? (LABELS[field][value] || value) : NINCS;
}

function validEmail(value) {
  return /^[^\s@,;:<>"']+@[^\s@,;:<>"']+\.[A-Za-z]{2,}$/.test(value);
}

/** Telefonszám: csak megengedett karakterek, legalább 7 számjegy. */
function validPhone(value) {
  if (!/^[+0-9][0-9 ()./-]{5,}$/.test(value)) return false;
  return (value.match(/[0-9]/g) || []).length >= 7;
}

function escapeHtml(value) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, (c) => map[c]);
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'ismeretlen';
}

/* ------------------------------------------------------------------ */
/* Turnstile                                                           */
/* ------------------------------------------------------------------ */

/**
 * Igaz, ha a kérés átmegy. Ha a titkos kulcs nincs beállítva, nem
 * blokkol — a méhkas és a kérésszámlálás ilyenkor is véd —, de
 * figyelmeztetést naplóz. A kulcs beállítása után kötelezővé válik.
 */
async function turnstileOk(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[lead] TURNSTILE_SECRET_KEY nincs beallitva - CAPTCHA-ellenorzes kihagyva.');
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip });
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const data = await res.json();
    if (!data.success) console.warn('[lead] Turnstile elutasitas:', data['error-codes']);
    return data.success === true;
  } catch (err) {
    console.error('[lead] Turnstile hivas hiba:', err && err.message);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Kéréstörzs beolvasása                                               */
/* ------------------------------------------------------------------ */

async function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    const type = String(req.headers['content-type'] || '');
    return { data: req.body, form: type.includes('x-www-form-urlencoded') };
  }

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20000) throw new Error('tul nagy kerestorzs');
  }
  const type = String(req.headers['content-type'] || '');
  if (type.includes('application/json')) {
    return { data: JSON.parse(raw || '{}'), form: false };
  }
  return { data: Object.fromEntries(new URLSearchParams(raw)), form: true };
}

/* ------------------------------------------------------------------ */
/* Válaszok                                                            */
/* ------------------------------------------------------------------ */

function htmlPage(title, message, ok) {
  const accent = ok ? '#9B8245' : '#303030';
  return '<!doctype html><html lang="hu"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex"><title>' + escapeHtml(title) + ' | LupaTherm</title></head>' +
    '<body style="margin:0;font:16px/1.6 system-ui,sans-serif;color:#303030;background:#fff">' +
    '<main style="max-width:560px;margin:0 auto;padding:64px 20px">' +
    '<h1 style="font-size:26px;font-weight:600;margin:0 0 14px">' + escapeHtml(title) + '</h1>' +
    '<p style="color:#4F4F4F;margin:0 0 24px">' + escapeHtml(message) + '</p>' +
    '<p style="margin:0 0 24px;color:#4F4F4F">Telefon: ' +
    '<a style="color:#7C6837" href="tel:+36301131261">+36 30 113 1261</a></p>' +
    '<a href="/" style="display:inline-block;padding:12px 20px;background:' + accent +
    ';color:#fff;text-decoration:none">Vissza a főoldalra</a>' +
    '</main></body></html>';
}

function respond(res, form, status, ok, title, message) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (form) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(htmlPage(title, message, ok));
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify({ ok, message }));
}

/* ------------------------------------------------------------------ */
/* Belépési pont                                                       */
/* ------------------------------------------------------------------ */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return respond(res, false, 405, false, 'Nem támogatott metódus',
      'Ez a végpont csak POST kéréseket fogad.');
  }

  let data;
  let form = false;
  try {
    const parsed = await readBody(req);
    data = parsed.data;
    form = parsed.form;
  } catch {
    return respond(res, false, 400, false, 'Hibás kérés', 'A beküldött adat nem értelmezhető.');
  }

  const ip = clientIp(req);

  /* 1. Méhkas — ezt a mezőt ember nem tölti ki, csak automata.
        Sikert jelzünk vissza, hogy a bot ne tanuljon a hibából. */
  if (clean(data.website, 200) !== '' || clean(data.cegnev_megerosites, 200) !== '') {
    console.warn('[lead] mehkas fogas, IP:', ip);
    return respond(res, form, 200, true, 'Köszönjük!', 'Megkaptuk az ajánlatkérésed.');
  }

  /* 2. Túl gyors kitöltés — emberi kitöltés nem fér bele 3 másodpercbe. */
  const renderedAt = Number(data.ts);
  if (Number.isFinite(renderedAt) && renderedAt > 0 && Date.now() - renderedAt < 3000) {
    console.warn('[lead] gyanusan gyors bekuldes, IP:', ip);
    return respond(res, form, 200, true, 'Köszönjük!', 'Megkaptuk az ajánlatkérésed.');
  }

  /* 3. Kérésszámlálás */
  if (rateLimited(ip)) {
    return respond(res, form, 429, false, 'Túl sok próbálkozás',
      'Néhány percen belül próbáld újra, vagy hívj minket telefonon.');
  }

  /* 4. CAPTCHA */
  const token = typeof data['cf-turnstile-response'] === 'string' ? data['cf-turnstile-response'] : '';
  const passed = await turnstileOk(token, ip);
  if (!passed) {
    return respond(res, form, 403, false, 'Az ellenőrzés nem sikerült',
      'Töltsd be újra az oldalt, és próbáld meg ismét.');
  }

  /* 5. Ellenőrzés és tisztítás */
  const nev      = clean(data.nev, MAX.nev);
  const telefon  = clean(data.telefon, MAX.telefon);
  const email    = clean(data.email, MAX.email);
  const helyszin = clean(data.helyszin, MAX.helyszin);
  const uzenet   = cleanMultiline(data.uzenet, MAX.uzenet);

  const hibak = [];
  if (nev.length < 2) hibak.push('név');
  if (!validPhone(telefon)) hibak.push('telefonszám');
  if (helyszin.length < 2) hibak.push('helyszín');
  if (email && !validEmail(email)) hibak.push('e-mail-cím');
  if (!data.hozzajarulas) hibak.push('adatkezelési hozzájárulás');

  if (hibak.length) {
    return respond(res, form, 422, false, 'Hiányzó vagy hibás adat',
      'Ellenőrizd a következőt: ' + hibak.join(', ') + '.');
  }

  const mezok = {
    ingatlan:  pickEnum('ingatlan',  data.ingatlan),
    darabszam: pickEnum('darabszam', data.darabszam),
    igeny:     pickEnum('igeny',     data.igeny),
    idozites:  pickEnum('idozites',  data.idozites),
    forras:    pickEnum('forras',    data.forras)
  };

  /* 6. Levél összeállítása — kizárólag szerveroldalon */
  const apiKey = process.env.RESEND_API_KEY;
  const to     = process.env.LEAD_TO_EMAIL;
  const from   = process.env.LEAD_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    const missing = [!apiKey && 'RESEND_API_KEY', !to && 'LEAD_TO_EMAIL', !from && 'LEAD_FROM_EMAIL']
      .filter(Boolean).join(', ');
    console.error('[lead] hianyzo kornyezeti valtozo:', missing);
    return respond(res, form, 500, false, 'A küldés átmenetileg nem érhető el',
      'Kérlek hívj minket telefonon: +36 30 113 1261');
  }

  const sorok = [
    ['Név', nev],
    ['Telefon', telefon],
    ['E-mail', email || NINCS],
    ['Helyszín', helyszin],
    ['Ingatlan', label('ingatlan', mezok.ingatlan)],
    ['Darabszám', label('darabszam', mezok.darabszam)],
    ['Igény', label('igeny', mezok.igeny)],
    ['Időzítés', label('idozites', mezok.idozites)],
    ['Megjegyzés', uzenet || NINCS],
    ['Forrás', label('forras', mezok.forras)],
    ['Beküldve', new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' })]
  ];

  const text = sorok.map(([k, v]) => k + ': ' + v).join('\n');
  const rows = sorok.map(([k, v]) =>
    '<tr><td style="padding:6px 16px 6px 0;color:#4F4F4F;vertical-align:top;white-space:nowrap">' +
    escapeHtml(k) + '</td><td style="padding:6px 0;white-space:pre-wrap">' +
    escapeHtml(v) + '</td></tr>').join('');
  const html = '<div style="font:15px/1.6 system-ui,sans-serif;color:#303030">' +
    '<h2 style="font-size:19px;margin:0 0 16px">Új ajánlatkérés — ' +
    escapeHtml(label('igeny', mezok.igeny)) + '</h2>' +
    '<table style="border-collapse:collapse">' + rows + '</table></div>';

  /* A címzettet és a tárgyat a szerver adja — a kliens nem befolyásolhatja. */
  const payload = {
    from: from,
    to: [to],
    subject: 'Ajánlatkérés — ' + label('igeny', mezok.igeny) + ' — ' + nev,
    text: text,
    html: html
  };
  if (email && validEmail(email)) payload.reply_to = [email];

  /* 7. Küldés a Resend REST API-ján keresztül */
  try {
    const send = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!send.ok) {
      /* A hibaválasz tartalmazhat kulcsrészletet — csak a státuszt naplózzuk. */
      console.error('[lead] Resend hibavalasz, statusz:', send.status);
      return respond(res, form, 502, false, 'A küldés nem sikerült',
        'Kérlek próbáld újra, vagy hívj minket: +36 30 113 1261');
    }
  } catch (err) {
    console.error('[lead] Resend hivas hiba:', err && err.message);
    return respond(res, form, 502, false, 'A küldés nem sikerült',
      'Kérlek próbáld újra, vagy hívj minket: +36 30 113 1261');
  }

  return respond(res, form, 200, true, 'Köszönjük!',
    'Megkaptuk az ajánlatkérésed, hamarosan keresünk telefonon.');
}
