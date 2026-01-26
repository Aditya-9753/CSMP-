import apiClient from "./apiClient";

/**
 * 🔧 CHANGES:
 * 1. Empty clientId guard add kiya
 * 2. try/catch for better error message
 * 3. Clean return
 */

export async function startHandshake(clientId) {
  const trimmed = clientId?.trim();

  if (!trimmed) {
    throw new Error("Client ID cannot be empty");
  }

  try {
    const res = await apiClient.post("/handshake/", {
      client_id: trimmed,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Handshake failed", err);
    throw new Error(
      err.response?.data?.detail || "Handshake failed. Try again."
    );
  }
}
