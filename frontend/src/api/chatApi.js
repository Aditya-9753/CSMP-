import apiClient from "./apiClient";

/**
 * 🔧 CHANGE:
 * - try/catch add kiya
 * - 401 ko properly surface kiya (logout / redirect ke kaam aayega)
 */

export async function sendChatMessage(message) {
  try {
    const res = await apiClient.post("/chat/send", { message });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      console.error("❌ Unauthorized: Session invalid or expired");
      throw new Error("Session expired. Please login again.");
    }
    throw err;
  }
}
