from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.auth_service import AuthService
from app.config import settings
import time

router = APIRouter()

# -----------------------------
# MODELS
# -----------------------------

class RegisterPayload(BaseModel):
    user_id: str

class HandshakePayload(BaseModel):
    client_id: str

# -----------------------------
# TEMP USER STORE (TESTING)
# -----------------------------
USERS_DB = {}

# -----------------------------
# REGISTER (CREATE ID)
# -----------------------------
@router.post("/register")
def register_identity(payload: RegisterPayload):
    user_id = payload.user_id.strip()

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")

    if user_id in USERS_DB:
        raise HTTPException(status_code=409, detail="User already exists")

    USERS_DB[user_id] = {
        "created_at": time.time()
    }

    return {
        "status": "ok",
        "user_id": user_id
    }

# -----------------------------
# HANDSHAKE / LOGIN
# -----------------------------
@router.post("/")
def handshake(payload: HandshakePayload):
    service = AuthService()
    session = service.handshake(payload.client_id)

    return {
        "session_id": session["session_id"],
        "client_id": session["client_id"],
        "protocol_version": settings.PROTOCOL_VERSION,
        "expires_in": settings.SESSION_TIMEOUT,
    }
