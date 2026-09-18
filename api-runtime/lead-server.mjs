/**
 * Runtime wrapper for the repo's api/lead.js.
 *
 * The repo file is a standard Vercel-style Node handler: `export default
 * async function handler(req, res)`. We do NOT modify it. This wrapper simply
 * mounts that exact handler on a plain Node http server (Node 20+), so that
 * POST /api/lead runs as a real server-side function.
 *
 * It listens on 127.0.0.1 only; the public /api/lead traffic is forwarded to
 * it by the platform's FastAPI process (which owns the ingress-facing port).
 * Secrets (RESEND_API_KEY, TURNSTILE_SECRET_KEY, LEAD_TO_EMAIL,
 * LEAD_FROM_EMAIL) are read by the handler from process.env only.
 */

import http from 'node:http';
import { pathToFileURL } from 'node:url';

const HANDLER_PATH = '/app/site/api/lead.js';
const HOST = '127.0.0.1';
const PORT = Number(process.env.LEAD_RUNTIME_PORT || 8002);

const mod = await import(pathToFileURL(HANDLER_PATH).href);
const handler = mod.default;

if (typeof handler !== 'function') {
  console.error('[lead-runtime] api/lead.js default export is not a function');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/lead') {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[lead-runtime] handler error:', err && err.message);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
      }
      res.end(JSON.stringify({ ok: false, message: 'Szerverhiba.' }));
    }
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ ok: false, message: 'Ismeretlen végpont.' }));
});

server.listen(PORT, HOST, () => {
  console.log(`[lead-runtime] api/lead.js listening on http://${HOST}:${PORT}`);
});
