# app/services/history_service.py

from app.services.chat_service import ChatService
from app.services.call_service import CallService


class HistoryService:
    """
    Unified history service.

    Provides:
    - Chat history
    - Call history
    - Lightweight unread events (STEP 13 safe mode)

    NOTE:
    No new tables, no new APIs, no frontend break.
    """

    # -------------------------------------------------
    # CHAT HISTORY
    # -------------------------------------------------
    @staticmethod
    def get_chat_history(client_id: str, session_id: str) -> list[dict]:
        """
        Full chat history for a user.
        """
        return ChatService.get_messages_by_client(client_id, session_id)

    # -------------------------------------------------
    # CALL HISTORY
    # -------------------------------------------------
    @staticmethod
    def get_call_history(client_id: str) -> list[dict]:
        """
        Full call history for a user.
        """
        rows = CallService.get_history(client_id)

        return [
            {
                "call_id": r.call_id,
                "caller": r.caller_id,
                "callee": r.callee_id,
                "status": r.status,
                "started_at": r.started_at,
                "ended_at": r.ended_at
            }
            for r in rows
        ]

    # -------------------------------------------------
    # UNREAD / RECENT EVENTS (STEP 13)
    # -------------------------------------------------
    @staticmethod
    def get_unread_events(client_id: str, session_id: str) -> dict:
        """
        Lightweight unread events.
        Used as notification fallback for offline users.
        """

        return {
            "chat": HistoryService.get_recent_chats(client_id, session_id),
            "calls": HistoryService.get_recent_calls(client_id)
        }

    # -------------------------------------------------
    # RECENT CHAT EVENTS
    # -------------------------------------------------
    @staticmethod
    def get_recent_chats(client_id: str, session_id: str, limit: int = 20):
        """
        Last N chat messages.
        """
        messages = ChatService.get_messages_by_client(client_id, session_id)
        return messages[-limit:]

    # -------------------------------------------------
    # RECENT CALL EVENTS
    # -------------------------------------------------
    @staticmethod
    def get_recent_calls(client_id: str, limit: int = 20):
        """
        Last N call records.
        """
        rows = CallService.get_history(client_id)
        return rows[:limit]
