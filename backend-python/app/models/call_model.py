from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.base import Base


class CallRecord(Base):
    __tablename__ = "call_records"

    id = Column(Integer, primary_key=True, index=True)

    call_id = Column(String, unique=True, index=True)

    caller_id = Column(String, index=True)
    callee_id = Column(String, index=True)

    status = Column(String, index=True)
    # initiated | ringing | connected | ended | rejected | missed

    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
