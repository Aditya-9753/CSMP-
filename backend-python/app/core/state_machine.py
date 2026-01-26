from enum import Enum

class SessionState(str, Enum):
    IDLE = "IDLE"
    ACTIVE = "ACTIVE"
    IN_CALL = "IN_CALL"
    CLOSED = "CLOSED"

class StateMachine:
    def __init__(self):
        self.state = SessionState.IDLE

    def transition(self, new_state: SessionState):
        self.state = new_state
        return self.state
