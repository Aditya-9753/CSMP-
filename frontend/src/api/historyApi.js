import apiClient from "./apiClient";

/**
 * 🔧 FIXES / ADDITIONS:
 * - room_id support (STEP 20)
 * - validation added
 * - safer return
 */

export const fetchChatHistory = async (roomId, limit = 50) => {
  try {
    if (!roomId || typeof roomId !== "string") {
      throw new Error("roomId missing (required for private chat history)");
    }

    const res = await apiClient.get(
      `/history/chat?room_id=${encodeURIComponent(roomId)}&limit=${limit}`
    );

    return res.data.items || [];
  } catch (err) {
    console.error("❌ Fetch chat history failed:", err.message);
    throw err;
  }
};
