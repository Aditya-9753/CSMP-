// src/ws/chatSocket.js
// STEP 20: room-based private chat support (FINAL FIX)

export const connectChatSocket = (
  sessionId,
  roomId,
  onMessageCallback
) => {
  // -------------------------------
  // 1️⃣ Validation (SAFE)
  // -------------------------------
  if (!sessionId || typeof sessionId !== "string") {
    console.error("❌ INVALID sessionId:", sessionId);
    return null;
  }

  if (!roomId || typeof roomId !== "string") {
    console.error("❌ INVALID roomId:", roomId);
    return null;
  }

  if (typeof onMessageCallback !== "function") {
    console.error("❌ INVALID onMessageCallback - must be a function");
    return null;
  }

  // -------------------------------
  // 2️⃣ WS URL (ENV-BASED ✅)
  // -------------------------------
  const BASE_WS_URL = import.meta.env.VITE_WS_CHAT_URL;

  if (!BASE_WS_URL) {
    console.error("❌ VITE_WS_CHAT_URL missing in .env");
    return null;
  }

  const url =
    `${BASE_WS_URL}` +
    `?session_id=${encodeURIComponent(sessionId)}` +
    `&room_id=${encodeURIComponent(roomId)}`;

  console.log("🔌 WS CONNECT URL:", url);

  // -------------------------------
  // 3️⃣ WebSocket Connect
  // -------------------------------
  const socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("✅ Chat WS connected | room:", roomId);
  };

  socket.onmessage = (event) => {
    try {
      const data =
        typeof event.data === "string"
          ? JSON.parse(event.data)
          : event.data;

      onMessageCallback(data); // 🔥 room-scoped data
    } catch (error) {
      console.error("❌ WS message parse error:", error, event.data);
    }
  };

  socket.onerror = (e) => {
    console.error("🔥 WS error", e);
  };

  socket.onclose = (e) => {
    console.warn(
      "⚠️ Chat WS closed",
      "code:",
      e.code,
      "reason:",
      e.reason || "no reason"
    );
  };

  // -------------------------------
  // 4️⃣ Return socket (caller controls lifecycle)
  // -------------------------------
  return socket;
};
