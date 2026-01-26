# app/core/call_engine.py
class CallEngine:
    _calls = {}

    @classmethod
    def create(cls, call_id, caller, callee):
        cls._calls[call_id] = {
            "caller": caller,
            "callee": callee,
            "state": "ringing"
        }

    @classmethod
    def update(cls, call_id, state):
        if call_id in cls._calls:
            cls._calls[call_id]["state"] = state

    @classmethod
    def end(cls, call_id):
        cls._calls.pop(call_id, None)
