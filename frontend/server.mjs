/**
 * Zero-dependency static file server for the LupaTherm site.
 *
 * The repo root (/app/site) is the web root, served verbatim:
 *   index.html = /,  404.html = error page,  robots.txt & sitemap.xml at root,
 *   assets/ served unchanged. No build step, no framework, no npm deps.
 *
 * This process is the platform layer that would normally be Vercel: it sets
 * the security headers and per-path caching that the repo's vercel.json
 * describes (the platform ignores vercel.json). /api/* never reaches here —
 * the ingress routes it to the backend function.
 */

import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const WEB_ROOT = '/app/site';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; " +
    "form-action 'self'; script-src 'self' https://connect.facebook.net https://challenges.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https://www.facebook.com; connect-src 'self' https://www.facebook.com https://connect.facebook.net; " +
    "frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function cacheControlFor(pathname) {
  if (pathname.endsWith('.html')) return 'max-age=0, must-revalidate';
  if (/^\/assets\/(css|js)\//.test(pathname)) return 'max-age=31536000, immutable';
  if (/^\/assets\/img\//.test(pathname)) return 'max-age=86400';
  return 'no-cache';
}

function applyHeaders(res, pathname, contentType) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', cacheControlFor(pathname));
}

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const resolved = path.normalize(path.join(root, decoded));
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

async function statFile(p) {
  try {
    const s = await fs.stat(p);
    return s.isFile() ? s : null;
  } catch {
    return null;
  }
}

async function resolveTarget(urlPath) {
  // '/' -> index.html
  if (urlPath === '/' || urlPath === '') return path.join(WEB_ROOT, 'index.html');

  let filePath = safeJoin(WEB_ROOT, urlPath);
  if (!filePath) return null;

  // Direct file hit
  if (await statFile(filePath)) return filePath;

  // cleanUrls: extensionless -> .html
  if (!path.extname(filePath)) {
    const asHtml = filePath + '.html';
    if (await statFile(asHtml)) return asHtml;
  }

  // Directory -> index.html inside it
  try {
    const s = await fs.stat(filePath);
    if (s.isDirectory()) {
      const idx = path.join(filePath, 'index.html');
      if (await statFile(idx)) return idx;
    }
  } catch {
    /* not found */
  }
  return null;
}

async function send404(res) {
  const notFound = path.join(WEB_ROOT, '404.html');
  const body = await fs.readFile(notFound).catch(() => Buffer.from('404 - Nem található'));
  applyHeaders(res, '/404.html', MIME['.html']);
  res.statusCode = 404;
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    // /api/* is owned by the backend function; never served statically.
    if (req.url.split('?')[0].startsWith('/api/')) {
      applyHeaders(res, '/api', MIME['.json']);
      res.setHeader('Cache-Control', 'no-store');
      res.statusCode = 404;
      res.end(JSON.stringify({ ok: false, message: 'API a szerveroldali függvényen keresztül érhető el.' }));
      return;
    }

    const target = await resolveTarget(req.url.split('?')[0]);
    if (!target) return send404(res);

    const ext = path.extname(target).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const pathname = '/' + path.relative(WEB_ROOT, target).split(path.sep).join('/');

    const body = await fs.readFile(target);
    applyHeaders(res, pathname, contentType);
    res.statusCode = 200;
    if (req.method === 'HEAD') return res.end();
    res.end(body);
  } catch (err) {
    console.error('[static] error:', err && err.message);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
    res.end('500 - Szerverhiba');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[static] LupaTherm served from ${WEB_ROOT} on http://${HOST}:${PORT}`);
});
