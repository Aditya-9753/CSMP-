from pydantic import BaseModel

class CallStartSchema(BaseModel):
    session_id: str
    caller_id: str

class CallEndSchema(BaseModel):
    session_id: str
