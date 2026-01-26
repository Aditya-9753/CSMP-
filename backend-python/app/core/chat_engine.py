class ChatEngine:
    def __init__(self):
        self.messages = []

    def add_message(self, user_id: str, message: str):
        payload = {
            "user_id": user_id,
            "message": message
        }
        self.messages.append(payload)
        return payload

    def get_history(self):
        return self.messages
