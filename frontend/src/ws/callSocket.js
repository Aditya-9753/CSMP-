import { WS_URL } from "../utils/constants";

export const initCallSocket = (sessionId, onMessage) => {
  const ws = new WebSocket(`${WS_URL}/call?session_id=${sessionId}`);

  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  ws.onclose = () => console.log("📞 Call socket closed");

  return ws;
};
