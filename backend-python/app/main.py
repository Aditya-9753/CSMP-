from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.config import settings
from app.database.base import Base
from app.database.connection import engine

# Middlewares
from app.middlewares.session_guard import session_guard

# Routers
from app.api.health_api import router as health_router
from app.api.handshake_api import router as handshake_router
from app.api.chat_api import router as chat_router
from app.api.history_api import router as history_router
from app.api.call_api import router as call_router

# WebSockets
from app.ws.chat_ws import chat_ws
from app.ws.call_ws import call_ws

import logging

# -------------------------------------------------
# 1. Logging Configuration
# -------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# -------------------------------------------------
# 2. Database Initialization
# -------------------------------------------------
# Yeh line ensure karti hai ki tables naye columns ke saath bane
Base.metadata.create_all(bind=engine)

# -------------------------------------------------
# 3. FastAPI App Instance
# -------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.PROTOCOL_VERSION,
    debug=settings.DEBUG,
)

# -------------------------------------------------
# 4. CORS Setup
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Content-Type", "x-session-id"],
    expose_headers=["x-session-id"],
)

# -------------------------------------------------
# 5. HTTP Middleware (Security logic)
# -------------------------------------------------
@app.middleware("http")
async def main_http_middleware(request: Request, call_next):
    # ✅ 1. Preflight bypass
    if request.method == "OPTIONS":
        return await call_next(request)

    path = request.url.path

    # ✅ 2. PUBLIC PATHS (No Session Guard needed)
    PUBLIC_PREFIXES = (
        "/health",
        "/handshake",
        "/docs",
        "/openapi.json",
        "/favicon.ico",
    )

    if path == "/" or any(path.startswith(p) for p in PUBLIC_PREFIXES):
        return await call_next(request)

    # 🔒 3. PROTECTED PATHS (Chat, History, Call)
    # Inhe hum session_guard ke hawale karenge taaki woh check kare session active hai ya nahi
    # Agar aapne yahan call_next() kiya toh bina login ke data access ho jayega
    return await session_guard(request, call_next)

# -------------------------------------------------
# 6. Global Exception Handlers
# -------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Data validation failed", "errors": exc.errors()},
    )

# -------------------------------------------------
# 7. Include All Routers
# -------------------------------------------------
app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(handshake_router, prefix="/handshake", tags=["Handshake"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(history_router, prefix="/history", tags=["History"])
app.include_router(call_router, prefix="/call", tags=["Call"])

# -------------------------------------------------
# 8. WebSocket Routes
# -------------------------------------------------
app.add_api_websocket_route("/ws/chat", chat_ws)
app.add_api_websocket_route("/ws/call", call_ws)

# 🔧 CHANGE:
# Duplicate websocket routes REMOVE kiye
# Pehle same routes 2 baar add ho rahe the
# (future me random bugs dete)

# -------------------------------------------------
# 9. Root Endpoint
# -------------------------------------------------
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to CSMP Backend!",
        "version": settings.PROTOCOL_VERSION,
        "environment": "development" if settings.DEBUG else "production",
        "endpoints": {
            "health": "/health",
            "handshake": "/handshake",
            "chat_http": "/chat/send",
            "chat_ws": "/ws/chat",
            "call_ws": "/ws/call",
            "call_history": "/call/history",
        },
        "docs": "/docs",
        "debug": settings.DEBUG,
    }
