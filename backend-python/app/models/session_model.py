from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime, timedelta
from app.database.base import Base
from app.config import settings

class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

    @staticmethod
    def expiry_time():
        return datetime.utcnow() + timedelta(seconds=settings.SESSION_TIMEOUT)
