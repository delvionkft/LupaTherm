# LupaTherm — Deployment (Emergent as host)

## Problem statement
Deploy the GitHub repo `delvionkft/LupaTherm` (branch `main`, commit `561ff75`) AS-IS:
static HTML/CSS/vanilla-JS site + one server-side function `api/lead.js`.
No build, no framework, zero npm deps. Security headers + per-path caching at the
platform layer (vercel.json ignored). Env vars server-side only. `api/lead.js`
must run as a real Node (>=20) function.

## Architecture on this (non-Vercel) platform
- Repo copied verbatim to `/app/site` (web root).
- **Static server** `/app/frontend/server.mjs` (zero-dep Node) serves `/app/site`
  on port 3000 (`yarn start` -> `node server.mjs`). Sets the 6 security headers on
  every route + per-path Cache-Control. Framing headers are relaxed ONLY on the
  Emergent preview host (so the preview iframe works); strict `frame-ancestors 'none'`
  + `X-Frame-Options: DENY` on the real deployment domain.
- **Lead function runtime** `/app/api-runtime/lead-server.mjs` imports the UNMODIFIED
  handler shape of `/app/site/api/lead.js` on 127.0.0.1:8002 (Node 20).
- **Backend** `/app/backend/server.py` (FastAPI on 8001, ingress-facing for `/api/*`)
  reverse-proxies `POST /api/lead` to the Node runtime, spawns/kills it, and applies
  the 6 security headers + `Cache-Control: no-store` on `/api/*`.

## Email sending — EmailJS (server-side)
`api/lead.js` was switched from Resend to **EmailJS** REST API
(`https://api.emailjs.com/api/v1.0/email/send`), called server-side only. All spam
protection (honeypot, timing, IP rate-limit, Turnstile) and JS-less native POST are
preserved. Credentials live only in `/app/backend/.env` (inherited by the Node
runtime), never in the browser:
`EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`.
Account is in strict mode -> private key (accessToken) required and configured.
`template_params` sends many common variable names (name/email/phone/message +
Hungarian nev/telefon/helyszin/uzenet/igeny/... ) so the "Kapcsolat" template matches.

## Verified (2026-06, preview URL)
- Live preview URL: https://lupatherm-preview-1.preview.emergentagent.com
- EmailJS send E2E: valid JSON -> 200 {ok:true} (real email sent); form-urlencoded ->
  200 HTML "Köszönjük!"; GET -> 405; missing field -> 422; honeypot -> fake 200.
  No secrets in browser HTML/JS. (testing_agent iteration_4: 9/9 pass.)
- Security headers on every route; origin per-path caching per spec (preview edge
  forces no-store on static — preview-only).
- UI: logo (assets/img/logo.png) in header/footer + favicon from logo emblem; footer
  top black utilbar removed; footer service-area line removed; services "Bejárati
  ajtók" tall-card gap fixed (`.service--tall .service__body{flex:0 0 auto}`).

## Repo edits made (per user requests, in /app/site)
- Removed footer "Szolgáltatási terület" line; removed header utilbar (black strip).
- Added real logo + favicon/apple-touch-icon (emblem crop); CSS ?v=20260918a.
- Services tall-card body flex fix.
- api/lead.js: Resend -> EmailJS server-side send.

## Backlog / next
- Finalize deploy via Emergent "Deploy"; set EMAILJS_* as backend env vars there and
  re-verify. Repo go-live edits (domain, noindex, robots Disallow, Turnstile site key)
  remain the user's GitHub-workflow tasks.
