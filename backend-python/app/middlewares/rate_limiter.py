import time
from fastapi import Request
from fastapi.responses import JSONResponse

from app.utils.redis_client import redis_client


# ---------------- CONFIG ----------------
RATE_LIMIT = 60          # requests
WINDOW_SECONDS = 60      # per minute
PREFIX = "rate:"


# Public paths that should NEVER be rate limited
PUBLIC_PATHS = (
    "/",
    "/favicon.ico",
    "/docs",
    "/openapi.json",
    "/health",
    "/handshake",
)


async def rate_limiter(request: Request, call_next):
    """
    Redis-backed rate limiter (SAFE VERSION)

    Rules:
    - Skip WebSocket completely
    - Skip public routes
    - Apply limit only to protected REST APIs
    """

    # ✅ Skip WebSocket traffic
    if request.scope["type"] == "websocket":
        return await call_next(request)

    path = request.url.path

    # ✅ Skip public paths
    for public in PUBLIC_PATHS:
        if path.startswith(public):
            return await call_next(request)

    # ---------------- RATE LIMIT LOGIC ----------------

    session_id = request.headers.get("x-session-id")
    client_ip = request.client.host if request.client else "unknown"

    key = PREFIX + (session_id or client_ip)
    now = int(time.time())

    try:
        current = redis_client.get(key)

        if current and int(current) >= RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please slow down."}
            )

        # Atomic increment + expiry
        pipe = redis_client.pipeline()
        pipe.incr(key, 1)
        pipe.expire(key, WINDOW_SECONDS)
        pipe.execute()

    except Exception:
        # 🔒 Fail-open strategy (never break app if Redis is down)
        pass

    return await call_next(request)
