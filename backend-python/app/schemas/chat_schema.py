from pydantic import BaseModel

class ChatMessageSchema(BaseModel):
    session_id: str
    user_id: str
    message: str
