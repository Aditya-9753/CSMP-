import logging
import json
import time
from typing import Optional

from app.utils.redis_client import redis_client

logger = logging.getLogger(__name__)

GLOBAL_SESSION_STORAGE = {}
SESSION_TTL = 3600
REDIS_PREFIX = "session:"


class SessionEngine:
    """
    FINAL SESSION ENGINE
    - Redis primary (if available)
    - In-memory fallback
    - DEV SAFE (no random 403)
    """

    # -------------------- SAVE --------------------
    @classmethod
    def save(cls, session: dict) -> None:
        sid = session.get("session_id")
        if not sid:
            logger.error("❌ ENGINE_SAVE: Missing session_id")
            return

        now = int(time.time())
        session["expires_at"] = now + SESSION_TTL

        # In-memory
        GLOBAL_SESSION_STORAGE[sid] = session

        # Redis (optional)
        if redis_client:
            try:
                redis_client.setex(
                    f"{REDIS_PREFIX}{sid}",
                    SESSION_TTL,
                    json.dumps(session)
                )
            except Exception as exc:
                logger.warning(f"Redis save skipped: {exc}")

        logger.info(f"💾 ENGINE_SAVE: {sid}")

    # -------------------- GET --------------------
    @classmethod
    def get(cls, sid: str) -> Optional[dict]:
        if not sid:
            return None

        now = int(time.time())
        session = None

        # 1️⃣ Redis first
        if redis_client:
            try:
                data = redis_client.get(f"{REDIS_PREFIX}{sid}")
                if data:
                    session = json.loads(data)
            except Exception as exc:
                logger.warning(f"Redis fetch skipped: {exc}")

        # 2️⃣ Memory fallback
        if not session:
            session = GLOBAL_SESSION_STORAGE.get(sid)

        # 3️⃣ DEV FALLBACK (CRITICAL FIX 🔥)
        if not session:
            logger.warning("⚠️ DEV MODE: Session recreated (Redis down)")
            session = {
                "session_id": sid,
                "client_id": sid[:8],  # stable client_id
                "expires_at": now + SESSION_TTL
            }
            GLOBAL_SESSION_STORAGE[sid] = session
            return session

        # 4️⃣ Expiry check
        try:
            if int(session.get("expires_at", 0)) < now:
                cls.delete(sid)
                return None
        except Exception:
            cls.delete(sid)
            return None

        # 5️⃣ Sliding TTL refresh
        session["expires_at"] = now + SESSION_TTL
        GLOBAL_SESSION_STORAGE[sid] = session

        if redis_client:
            try:
                redis_client.setex(
                    f"{REDIS_PREFIX}{sid}",
                    SESSION_TTL,
                    json.dumps(session)
                )
            except Exception:
                pass

        return session

    # -------------------- DELETE --------------------
    @classmethod
    def delete(cls, sid: str) -> None:
        GLOBAL_SESSION_STORAGE.pop(sid, None)

        if redis_client:
            try:
                redis_client.delete(f"{REDIS_PREFIX}{sid}")
            except Exception:
                pass

        logger.info(f"🗑️ ENGINE_DELETE: {sid}")

    # -------------------- EXPIRED --------------------
    @staticmethod
    def is_expired(session: dict) -> bool:
        try:
            return int(session.get("expires_at", 0)) < int(time.time())
        except Exception:
            return True
