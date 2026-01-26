from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from datetime import datetime
from app.database.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(String, index=True, nullable=False)
    recipient_id = Column(String, index=True, nullable=True)

    session_id = Column(String, index=True, nullable=False)
    room_id = Column(String, index=True, nullable=False)

    message_type = Column(String, default="text", index=True)

    ciphertext = Column(Text, nullable=False)
    nonce = Column(String, nullable=False)

    status = Column(String, default="sent", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        Index("ix_room_id_created_at", "room_id", "created_at"),
    )
