from pydantic import BaseModel

class HandshakeRequest(BaseModel):
    user_id: str
    protocol_version: str

class HandshakeResponse(BaseModel):
    session_id: str
    protocol_version: str
