from pydantic import BaseModel
from datetime import datetime

class HistoryModel(BaseModel):
    event: str
    user_id: str
    timestamp: datetime
