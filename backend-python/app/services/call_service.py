# app/services/call_service.py

from typing import Dict, List


class CallService:
    """
    Manages active call states (in-memory).
    Later replace with Redis / DB.
    """

    _calls: Dict[str, dict] = {}

    @classmethod
    def create_call(cls, call_id: str, caller: str, callee: str):
        cls._calls[call_id] = {
            "call_id": call_id,
            "caller": caller,
            "callee": callee,
            "state": "ringing"  # ringing -> connected -> ended
        }

    @classmethod
    def get_call(cls, call_id: str):
        return cls._calls.get(call_id)

    @classmethod
    def update_state(cls, call_id: str, state: str):
        if call_id in cls._calls:
            cls._calls[call_id]["state"] = state

    @classmethod
    def end_call(cls, call_id: str):
        cls._calls.pop(call_id, None)

    # ✅ ADD THIS METHOD (IMPORTANT)
    @classmethod
    def get_history(cls, client_id: str) -> List[dict]:
        """
        Returns call history for a client (in-memory).
        """
        return [
            call for call in cls._calls.values()
            if call["caller"] == client_id or call["callee"] == client_id
        ]
