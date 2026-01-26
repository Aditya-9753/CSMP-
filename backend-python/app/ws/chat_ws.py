from fastapi import WebSocket, WebSocketDisconnect, status
import time
import json
from typing import Dict

from app.core.session_engine import SessionEngine
from app.services.chat_service import ChatService
from app.crypto.key_manager import KeyManager
from app.crypto.aes_gcm import AESGCMCipher

MIN_MESSAGE_INTERVAL = 0.5
MAX_MESSAGE_LENGTH = 1000

# session_id -> { ws, room_id, client_id }
ACTIVE_CONNECTIONS: Dict[str, Dict] = {}


async def chat_ws(websocket: WebSocket):
    session_id = websocket.query_params.get("session_id")
    room_id = websocket.query_params.get("room_id")

    if not session_id or not room_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    session = SessionEngine.get(session_id)
    if not session or SessionEngine.is_expired(session):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    client_id = session["client_id"]
    await websocket.accept()

    ACTIVE_CONNECTIONS[session_id] = {
        "ws": websocket,
        "room_id": room_id,
        "client_id": client_id,
    }

    print(f"✅ WS CHAT CONNECTED | client={client_id} | room={room_id}")

    key = KeyManager.derive_key(session_id)
    last_message_time = 0.0

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw) if raw.startswith("{") else {
                "type": "chat",
                "message": raw
            }

            now = time.time()
            if now - last_message_time < MIN_MESSAGE_INTERVAL:
                continue
            last_message_time = now

            if data.get("type") == "chat":
                message = data.get("message")
                if not message or len(message) > MAX_MESSAGE_LENGTH:
                    continue

                record = ChatService.save_message(
                    session=session,
                    message=message,
                    room_id=room_id,
                )

                plaintext = AESGCMCipher.decrypt(
                    key,
                    record["ciphertext"],
                    record["nonce"],
                )

                payload = {
                    "type": "chat",
                    "from": client_id,
                    "room_id": room_id,
                    "message": plaintext,
                    "timestamp": record["timestamp"],
                }

                for conn in ACTIVE_CONNECTIONS.values():
                    if conn["room_id"] == room_id:
                        await conn["ws"].send_json(payload)

    except WebSocketDisconnect:
        pass
    finally:
        ACTIVE_CONNECTIONS.pop(session_id, None)
        print(f"❌ WS CHAT DISCONNECTED | client={client_id} | room={room_id}")
