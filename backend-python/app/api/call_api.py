from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.services.call_service import CallService

router = APIRouter(prefix="/call", tags=["Call"])


# -----------------------------
# Pydantic Schema
# -----------------------------
class CallSchema(BaseModel):
    call_id: str
    caller: str
    callee: str
    status: str
    started_at: Optional[datetime]
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True


# -----------------------------
# Dependency: current client
# -----------------------------
def get_current_client_id(request: Request):
    session = getattr(request.state, "session", None)
    if not session or "client_id" not in session:
        raise HTTPException(status_code=401, detail="Session invalid or expired")
    return session["client_id"]


# -----------------------------
# API: Call History
# -----------------------------
@router.get("/history")
async def get_call_history(
    client_id: str = Depends(get_current_client_id)
):
    rows = CallService.get_history(client_id) or []

    return {
        "count": len(rows),
        "calls": [
            {
                "call_id": r.call_id,
                "caller": r.caller_id,
                "callee": r.callee_id,
                "status": r.status,
                "started_at": r.started_at,
                "ended_at": r.ended_at,
            }
            for r in rows
        ]
    }
