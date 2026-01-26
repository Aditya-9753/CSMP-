from datetime import datetime
from typing import List, Dict
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.chat_message_model import ChatMessage
from app.crypto.key_manager import KeyManager
from app.crypto.aes_gcm import AESGCMCipher


class ChatService:

    @staticmethod
    def save_message(session: dict, message: str, room_id: str) -> Dict:
        db: Session = SessionLocal()
        try:
            session_id = session["session_id"]
            client_id = session["client_id"]

            key = KeyManager.derive_key(session_id)
            encrypted = AESGCMCipher.encrypt(key, message)

            db_msg = ChatMessage(
                client_id=client_id,
                session_id=session_id,
                room_id=room_id,
                message_type="text",
                ciphertext=encrypted["ciphertext"],
                nonce=encrypted["nonce"],
                status="sent",
                created_at=datetime.utcnow()
            )

            db.add(db_msg)
            db.commit()
            db.refresh(db_msg)

            return {
                "id": db_msg.id,
                "from": client_id,
                "ciphertext": db_msg.ciphertext,
                "nonce": db_msg.nonce,
                "status": db_msg.status,
                "timestamp": db_msg.created_at.isoformat(),
                "room_id": room_id,
            }

        finally:
            db.close()

    @staticmethod
    def get_messages_by_room(
        room_id: str,
        session_id: str,
        limit: int = 50
    ) -> List[Dict]:

        db: Session = SessionLocal()
        try:
            key = KeyManager.derive_key(session_id)

            rows = (
                db.query(ChatMessage)
                .filter(ChatMessage.room_id == room_id)
                .order_by(ChatMessage.created_at.desc())
                .limit(limit)
                .all()
            )

            rows.reverse()

            return [
                {
                    "id": row.id,
                    "from": row.client_id,
                    "message": AESGCMCipher.decrypt(
                        key, row.ciphertext, row.nonce
                    ),
                    "status": row.status,
                    "timestamp": row.created_at.isoformat(),
                    "room_id": row.room_id,
                }
                for row in rows
            ]

        finally:
            db.close()
