from fastapi import APIRouter, Request, HTTPException, Query
from app.services.chat_service import ChatService

router = APIRouter()

@router.get("/{room_id}")
async def get_history(room_id: str, request: Request, limit: int = Query(50)):
    session = getattr(request.state, "session", None)
    if not session:
        raise HTTPException(status_code=401, detail="Session expired")

    try:
        return ChatService.get_messages_by_room(
            room_id=room_id,
            session_id=session["session_id"],
            limit=limit
        )
    except Exception as e:
        print("History error:", e)
        raise HTTPException(status_code=500, detail="History load failed")
