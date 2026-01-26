import { useSessionContext } from "../context/SessionContext";
import { useEffect, useState } from "react";

export const useSession = () => {
  const {
    sessionId,
    clientId,
    saveSession,
    clearSession
  } = useSessionContext();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /*
      AUTH RULES (IMPORTANT):
      - sessionId must exist
      - sessionId must not be junk
      - sessionId length sanity check
      - clientId must exist
    */

    const validSession =
      typeof sessionId === "string" &&
      sessionId.length > 10 &&
      sessionId !== "undefined" &&
      sessionId !== "null" &&
      Boolean(clientId);

    setIsAuthenticated(validSession);
    setLoading(false);
  }, [sessionId, clientId]);

  return {
    sessionId,
    clientId,
    isAuthenticated,
    loading,
    saveSession,
    clearSession
  };
};
