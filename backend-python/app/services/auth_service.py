from app.core.session_engine import SessionEngine
import uuid
import time

class AuthService:
    def handshake(self, client_id: str) -> dict:
        session = {
            "session_id": str(uuid.uuid4()),
            "client_id": client_id,
            "created_at": int(time.time()),
        }

        SessionEngine.save(session)   # ✅ CLASS METHOD

        return session
