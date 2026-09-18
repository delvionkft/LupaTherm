# LupaTherm — Deployment (Emergent as host)

## Problem statement
Deploy the GitHub repo `delvionkft/LupaTherm` (branch `main`, commit `561ff75`) AS-IS:
static HTML/CSS/vanilla-JS site + one server-side function `api/lead.js`.
No build, no framework, zero npm deps. Do NOT rewrite/rename/move any repo file.
Set security headers + per-path caching at the platform layer (vercel.json ignored).
Env vars server-side only. `api/lead.js` must run as a real Node (>=20) function.

## Architecture on this (non-Vercel) platform
- Repo copied verbatim to `/app/site` (web root). No repo file modified.
- **Static server** `/app/frontend/server.mjs` (zero-dep Node) serves `/app/site`
  on port 3000 (`yarn start` rewired to `node server.mjs`). Sets the 6 required
  security headers on every route + per-path Cache-Control. Handles `/`,
  `404.html`, cleanUrls, robots.txt/sitemap.xml, `assets/`.
- **Lead function runtime** `/app/api-runtime/lead-server.mjs` imports the repo's
  UNMODIFIED `api/lead.js` default handler and mounts it on 127.0.0.1:8002 (Node 20).
- **Backend** `/app/backend/server.py` (FastAPI on 8001, ingress-facing for `/api/*`)
  reverse-proxies `POST /api/lead` to the Node runtime, forwards client IP,
  spawns/kills the Node runtime on startup/shutdown, and applies the 6 security
  headers + `Cache-Control: no-store` to all `/api/*` responses.

## Env vars (server-side only, never in repo, never in browser)
Placeholders (empty) live in `/app/backend/.env` and are inherited by the Node
runtime via `process.env`: `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`,
`TURNSTILE_SECRET_KEY`. Fill real values in preview (edit `/app/backend/.env` +
`sudo supervisorctl restart backend`); in the deployed env set them as backend
environment variables. Until set: form runs but email is not sent (handler returns
the "call us" message) and Turnstile check is skipped — by design.

## Verified (2026-06, preview URL)
- Live preview URL: https://lupatherm-preview-1.preview.emergentagent.com
- `POST /api/lead` runs server-side (Node): GET→405, invalid→422, valid→500
  (reaches Resend env check = full handler executed), honeypot→fake 200,
  JSON and x-www-form-urlencoded both handled (form path returns HTML).
- Security headers present on every route (CSP without unsafe-inline/eval, HSTS,
  X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Origin caching exactly per spec (html max-age=0 must-revalidate; assets/css|js
  immutable 1y; assets/img 86400; /api no-store). NOTE: preview EDGE rewrites
  static Cache-Control to no-store (preview-only artifact); production may differ.
- Homepage renders (fonts, hero, consent bar) under the strict CSP.

## Not done on purpose (repo-level go-live edits, per DEPLOY.md — user's GitHub workflow)
- `[DOMAIN]`, `[TURNSTILE_SITE_KEY]`, `noindex` meta, `robots.txt Disallow` — these
  are repo edits the user makes in their source workflow; we must not modify repo files.

## Backlog / next
- User supplies the 4 env values to activate email + CAPTCHA.
- Finalize deploy via Emergent "Deploy" and re-verify headers/caching at production edge.
