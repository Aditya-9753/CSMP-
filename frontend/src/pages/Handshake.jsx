import { useState } from "react";
import { startHandshake } from "../api/handshakeApi";
import { useSession } from "../hooks/useSession";
import { useNavigate } from "react-router-dom";

export default function Handshake() {
  const [clientIdInput, setClientIdInput] = useState("");
  const { saveSession } = useSession();
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      const data = await startHandshake(clientIdInput);

      // ✅ JUST SAVE WHAT BACKEND RETURNS
      saveSession(data);

      // ✅ UI transition
      navigate("/chat");
    } catch (err) {
      alert("Handshake Failed: " + err.message);
    }
  };

  return (
    <div style={{ padding: 50, textAlign: "center" }}>
      <input
        value={clientIdInput}
        onChange={(e) => setClientIdInput(e.target.value)}
        placeholder="Enter Client ID"
      />
      <button onClick={handleStart}>Connect</button>
    </div>
  );
}
