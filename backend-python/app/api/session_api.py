from fastapi import APIRouter, HTTPException
from uuid import uuid4
from app.schemas.session_schema import SessionCreateResponse

router = APIRouter(prefix="/session", tags=["Session"])

active_sessions = {}

@router.post("/create", response_model=SessionCreateResponse)
def create_session():
    session_id = str(uuid4())
    active_sessions[session_id] = {
        "users": [],
        "created": True
    }
    return {"session_id": session_id}

@router.get("/{session_id}")
def get_session(session_id: str):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return active_sessions[session_id]
