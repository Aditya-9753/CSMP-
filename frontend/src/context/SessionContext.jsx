import { createContext, useContext, useState } from "react";

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem("session_id")
  );

  const [clientId, setClientId] = useState(
    () => localStorage.getItem("client_id")
  );

  const saveSession = (data) => {
    if (!data?.session_id) return;

    setSessionId(data.session_id);
    localStorage.setItem("session_id", data.session_id);

    // 🔥 UI PURPOSE ONLY
    if (data.client_id) {
      setClientId(data.client_id);
      localStorage.setItem("client_id", data.client_id);
    }
  };

  const clearSession = () => {
    setSessionId(null);
    setClientId(null);
    localStorage.removeItem("session_id");
    localStorage.removeItem("client_id");
  };

  return (
    <SessionContext.Provider
      value={{ sessionId, clientId, saveSession, clearSession }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSessionContext must be used inside SessionProvider");
  }
  return ctx;
};
