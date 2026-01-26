from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from app.services.chat_service import ChatService
from app.core.session_engine import SessionEngine # Manual check ke liye
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    message: str

@router.post("/send")
async def send_chat_message(message_data: ChatMessage, request: Request):
    # 1. Koshish karein middleware wala session mil jaye
    session = getattr(request.state, "session", None)

    # 2. 🔥 FAIL-SAFE LOGIC: Agar middleware ne nahi diya, toh khud Header se nikalo
    if not session:
        logger.info("🔍 Router: Session not in state, trying manual fetch from header...")
        session_id = request.headers.get("x-session-id")
        if session_id:
            session = SessionEngine.get(session_id)

    # 3. Final Check: Agar ab bhi nahi mila toh 401
    if not session:
        logger.error("❌ Session access failed in Chat API")
        raise HTTPException(
            status_code=401, 
            detail="Unauthorized: Session invalid or expired"
        )

    try:
        # 4. Save message using service
        record = ChatService.save_message(session, message_data.message)
        
        logger.info(f"✅ Message sent by Client: {session.get('client_id')}")
        
        return {
            "status": "sent",
            "client_id": session.get("client_id"),
            "message": message_data.message,
            "id": record.get("id") if record else None
        }
    except Exception as e:
        logger.error(f"❌ Save error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while saving message")