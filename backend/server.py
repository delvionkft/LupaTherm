"""
Platform backend for the LupaTherm static site.

This process owns the ingress-facing port (8001) to which the platform routes
every /api/* request. Its only real job is to run the repo's server-side
function api/lead.js — UNMODIFIED — and forward POST /api/lead to it.

api/lead.js is a Node (ESM) handler and cannot run inside Python, so we launch
it with Node 20 on a private loopback port and reverse-proxy to it here. This
mirrors exactly what a serverless platform (Vercel) does under the hood.

Secrets are read only by the Node function from process.env; they are never
sent to the browser and never written into any repo file.
"""

import os
import signal
import socket
import subprocess
import time
import logging
from contextlib import asynccontextmanager

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import Response
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("lupatherm")

LEAD_RUNTIME_PORT = int(os.environ.get("LEAD_RUNTIME_PORT", "8002"))
LEAD_RUNTIME_SCRIPT = "/app/api-runtime/lead-server.mjs"
LEAD_RUNTIME_URL = f"http://127.0.0.1:{LEAD_RUNTIME_PORT}"

SECURITY_HEADERS = {
    "Content-Security-Policy": (
        "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; "
        "form-action 'self'; script-src 'self' https://connect.facebook.net https://challenges.cloudflare.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https://www.facebook.com; connect-src 'self' https://www.facebook.com https://connect.facebook.net; "
        "frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests"
    ),
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
}

_node_proc = None


def _wait_for_port(port: int, timeout: float = 10.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            if s.connect_ex(("127.0.0.1", port)) == 0:
                return True
        time.sleep(0.2)
    return False


def _start_node_runtime():
    global _node_proc
    # Ensure no stale instance from a previous (hot-reload) run holds the port.
    subprocess.run(["pkill", "-f", LEAD_RUNTIME_SCRIPT], check=False)
    time.sleep(0.3)
    env = os.environ.copy()
    env["LEAD_RUNTIME_PORT"] = str(LEAD_RUNTIME_PORT)
    _node_proc = subprocess.Popen(
        ["node", LEAD_RUNTIME_SCRIPT],
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if _wait_for_port(LEAD_RUNTIME_PORT):
        logger.info("api/lead.js Node runtime is up on %s", LEAD_RUNTIME_URL)
    else:
        logger.error("api/lead.js Node runtime did NOT start on port %s", LEAD_RUNTIME_PORT)


def _stop_node_runtime():
    global _node_proc
    if _node_proc and _node_proc.poll() is None:
        _node_proc.send_signal(signal.SIGTERM)
        try:
            _node_proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            _node_proc.kill()
    subprocess.run(["pkill", "-f", LEAD_RUNTIME_SCRIPT], check=False)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _start_node_runtime()
    yield
    _stop_node_runtime()


app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def security_and_cache_headers(request: Request, call_next):
    response = await call_next(request)
    for k, v in SECURITY_HEADERS.items():
        response.headers[k] = v
    # /api/* is never cached.
    response.headers["Cache-Control"] = "no-store"
    return response


@app.api_route("/api/lead", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_lead(request: Request):
    """Reverse-proxy the request to the real Node api/lead.js function."""
    body = await request.body()

    forward_headers = {}
    ct = request.headers.get("content-type")
    if ct:
        forward_headers["content-type"] = ct
    # Preserve the real client IP for the handler's rate-limiter / Turnstile.
    xff = request.headers.get("x-forwarded-for")
    client_ip = xff or (request.client.host if request.client else "")
    if client_ip:
        forward_headers["x-forwarded-for"] = client_ip
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        forward_headers["x-real-ip"] = real_ip

    try:
        async with httpx.AsyncClient(timeout=20.0) as clientx:
            upstream = await clientx.request(
                request.method,
                f"{LEAD_RUNTIME_URL}/api/lead",
                content=body,
                headers=forward_headers,
            )
    except Exception as exc:  # noqa: BLE001
        logger.error("Proxy to Node runtime failed: %s", exc)
        return Response(
            content='{"ok":false,"message":"A küldés átmenetileg nem érhető el, kérlek hívj minket: +36 30 113 1261"}',
            status_code=502,
            media_type="application/json; charset=utf-8",
        )

    passthrough = {}
    for h in ("content-type",):
        if h in upstream.headers:
            passthrough[h] = upstream.headers[h]

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=passthrough,
    )


@app.get("/api/health")
async def health():
    up = _wait_for_port(LEAD_RUNTIME_PORT, timeout=1.0)
    return {"ok": True, "lead_runtime": "up" if up else "down"}
