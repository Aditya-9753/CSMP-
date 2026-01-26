export const storage = {
  saveSession: (sessionId, clientId) => {
    localStorage.setItem("session_id", sessionId);
    localStorage.setItem("client_id", clientId);
  },
  getSession: () => ({
    sessionId: localStorage.getItem("session_id"),
    clientId: localStorage.getItem("client_id")
  }),
  clearSession: () => {
    localStorage.clear();
    window.location.href = "/"; // Force redirect to handshake
  }
};