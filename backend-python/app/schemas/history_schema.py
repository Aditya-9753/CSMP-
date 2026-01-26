from pydantic import BaseModel
from datetime import datetime

class HistorySchema(BaseModel):
    event: str
    user_id: str
    timestamp: datetime
