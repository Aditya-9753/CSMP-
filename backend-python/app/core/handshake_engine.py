# app/core/handshake_engine.py

import uuid
import time
from app.config import settings
from app.core.session_engine import SessionEngine

class HandshakeEngine:
    """
    Handles protocol handshake & session creation
    """

    def create_session(self, client_id: str) -> dict:
        now = int(time.time())

        session = {
            "session_id": str(uuid.uuid4()),
            "client_id": client_id,
            "issued_at": now,
            "expires_at": now + settings.SESSION_TIMEOUT,
        }

        # ✅ CORRECT: SessionEngine ka actual method
        SessionEngine.save(session)

        return session
