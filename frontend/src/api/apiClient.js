import axios from "axios";

// ----------------------------------
// 1️⃣ Axios Instance (ENV BASED ✅)
// ----------------------------------
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // 🔥 FIXED
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ----------------------------------
// 2️⃣ Request Interceptor (FINAL)
// ----------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // 🔥 IMPORTANT:
    // Handshake endpoint should NEVER send session header
    if (url.startsWith("/handshake")) {
      delete config.headers["x-session-id"];
      return config;
    }

    const sessionId = localStorage.getItem("session_id");

    if (sessionId && typeof sessionId === "string") {
      config.headers["x-session-id"] = sessionId;
      console.log("✅ x-session-id attached:", sessionId);
    } else {
      delete config.headers["x-session-id"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
