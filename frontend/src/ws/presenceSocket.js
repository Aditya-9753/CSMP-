import { WS_URL } from "../utils/constants";

export const initPresenceSocket = (sessionId, onStatusUpdate) => {
  if (!sessionId) return null;

  const ws = new WebSocket(`${WS_URL}/presence?session_id=${sessionId}`);

  ws.onopen = () => console.log("🟢 Presence System Connected");

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Expected data: { "user_id": "devi_01", "status": "online" }
    onStatusUpdate(data);
  };

  ws.onclose = () => console.log("🔴 Presence System Disconnected");
  ws.onerror = (err) => console.error("Presence Socket Error:", err);

  return ws;
};