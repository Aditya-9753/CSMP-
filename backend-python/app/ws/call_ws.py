# app/ws/call_ws.py
from fastapi import WebSocket, WebSocketDisconnect, status
from typing import Dict
import uuid, time

from app.core.session_engine import SessionEngine
from app.services.call_service import CallService

MIN_EVENT_INTERVAL = 0.15


class CallConnectionManager:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}

    async def connect(self, ws: WebSocket, client_id: str):
        await ws.accept()
        self.connections[client_id] = ws

    def disconnect(self, client_id: str):
        self.connections.pop(client_id, None)

    async def send(self, client_id: str, payload: dict):
        ws = self.connections.get(client_id)
        if ws:
            await ws.send_json(payload)


manager = CallConnectionManager()


async def call_ws(websocket: WebSocket):
    session_id = websocket.query_params.get("session_id")
    if not session_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    session = SessionEngine.get(session_id)
    if not session or SessionEngine.is_expired(session):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    client_id = session["client_id"]
    await manager.connect(websocket, client_id)

    last_event = 0.0
    print(f"📞 CALL WS CONNECTED | {client_id}")

    try:
        while True:
            data = await websocket.receive_json()

            now = time.time()
            if now - last_event < MIN_EVENT_INTERVAL:
                continue
            last_event = now

            etype = data.get("type")

            # ================= INIT =================
            if etype == "call:init":
                call_id = str(uuid.uuid4())
                callee = data["to"]
                call_type = data.get("call_type", "voice")

                CallService.create_call(call_id, client_id, callee)

                # 🔔 SEND TO CALLEE (RINGING)
                await manager.send(callee, {
                    "type": "call:incoming",
                    "call_id": call_id,
                    "from": client_id,
                    "call_type": call_type
                })

                # ✅ SEND BACK TO CALLER (ACK – MOST IMPORTANT)
                await manager.send(client_id, {
                    "type": "call:ack",
                    "call_id": call_id,
                    "to": callee,
                    "call_type": call_type
                })

            # ================= OFFER =================
            elif etype == "call:offer":
                await manager.send(data["to"], {
                    "type": "call:offer",
                    "call_id": data["call_id"],
                    "sdp": data["sdp"],
                    "from": client_id
                })

            # ================= ANSWER =================
            elif etype == "call:answer":
                CallService.update_state(data["call_id"], "connected")
                await manager.send(data["to"], {
                    "type": "call:answer",
                    "call_id": data["call_id"],
                    "sdp": data["sdp"]
                })

            # ================= ICE =================
            elif etype == "call:ice":
                await manager.send(data["to"], {
                    "type": "call:ice",
                    "candidate": data["candidate"]
                })

            # ================= END =================
            elif etype == "call:end":
                CallService.end_call(data["call_id"])
                await manager.send(data["to"], {
                    "type": "call:end",
                    "call_id": data["call_id"]
                })

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        print(f"📞 CALL WS DISCONNECTED | {client_id}")
