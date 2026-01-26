class HistoryManager:
    def __init__(self):
        self.history = []

    def log_event(self, event: dict):
        self.history.append(event)

    def get_history(self):
        return self.history
