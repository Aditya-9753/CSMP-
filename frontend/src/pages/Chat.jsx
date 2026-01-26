import { useState, useEffect, useRef } from "react";
import { useSession } from "../hooks/useSession";
import { useNavigate } from "react-router-dom";
import useChat from "../hooks/useChat";
import useCall from "../hooks/useCall";
import apiClient from "../api/apiClient";
import MessageBubble from "../components/MessageBubble";

export default function Chat() {
  const { clientId, sessionId, clearSession } = useSession();
  const navigate = useNavigate();

  const [targetUser, setTargetUser] = useState("");
  const [activeRoom, setActiveRoom] = useState("");
  const [text, setText] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { messages, setMessages, send } = useChat(activeRoom, sessionId);

  const { incomingCall, acceptCall, endCall } = useCall({
    sessionId,
    clientId
  });

  const scrollRef = useRef(null);

  /* ---------------- LOAD HISTORY ---------------- */
  useEffect(() => {
    if (!activeRoom) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await apiClient.get(`/history/${activeRoom}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("History load failed", err);
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [activeRoom]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- CHAT LOGIC ---------------- */
  const handleSendMessage = () => {
    if (!text.trim()) return;

    send(text);
    setMessages((prev) => [
      ...prev,
      {
        client_id: clientId,
        message: text,
        timestamp: new Date().toISOString()
      }
    ]);
    setText("");
  };

  const startChat = () => {
    if (!targetUser || targetUser === clientId) return;
    const ids = [clientId, targetUser].sort();
    setActiveRoom(`room_${ids[0]}_${ids[1]}`);
  };

  const startVoiceCall = () => {
    navigate(`/call?target=${targetUser}&type=voice`);
  };

  const startVideoCall = () => {
    navigate(`/call?target=${targetUser}&type=video`);
  };

  return (
    <div className="chat-root">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">🔐 CSMP</h2>

        <div className="user-badge">{clientId}</div>

        <input
          className="user-input"
          placeholder="Enter user id"
          value={targetUser}
          onChange={(e) => setTargetUser(e.target.value)}
        />

        <button className="primary-btn" onClick={startChat}>
          Start Chat
        </button>

        <button className="logout-btn" onClick={clearSession}>
          Logout
        </button>
      </aside>

      {/* CHAT AREA */}
      <main className="chat-main">
        {activeRoom ? (
          <>
            <header className="chat-header">
              <div>
                <h3>{targetUser}</h3>
                <small>{activeRoom}</small>
              </div>

              <div className="call-actions">
                <button onClick={startVoiceCall}>📞</button>
                <button onClick={startVideoCall}>🎥</button>
              </div>
            </header>

            <div className="chat-messages">
              {loadingHistory && (
                <div className="loading">Loading secure history…</div>
              )}

              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  message={m.message}
                  isMe={m.client_id === clientId}
                  timestamp={m.timestamp}
                />
              ))}

              <div ref={scrollRef} />
            </div>

            <footer className="chat-input">
              <input
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </footer>
          </>
        ) : (
          <div className="empty-state">
            <h2>🔒 Secure Chat</h2>
            <p>Select a user to start conversation</p>
          </div>
        )}
      </main>

      {/* INCOMING CALL MODAL */}
      {incomingCall && (
        <div className="call-modal">
          <div className="modal-box">
            <h3>📞 Incoming Call</h3>
            <p>{incomingCall.from} is calling you</p>
            <div className="modal-actions">
              <button className="accept" onClick={acceptCall}>
                Accept
              </button>
              <button className="reject" onClick={endCall}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CSS ================= */}
      <style>{`
        .chat-root {
          display: flex;
          height: 100vh;
          background: #0f172a;
          color: white;
          font-family: Inter, system-ui;
        }

        .sidebar {
          width: 280px;
          background: #020617;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          border-right: 1px solid #1e293b;
        }

        .logo {
          text-align: center;
          color: #6366f1;
        }

        .user-badge {
          background: #1e293b;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
          font-size: 0.9rem;
        }

        .user-input {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #334155;
          background: #020617;
          color: white;
        }

        .primary-btn {
          background: #4f46e5;
          border: none;
          padding: 10px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }

        .logout-btn {
          margin-top: auto;
          background: #7f1d1d;
          border: none;
          padding: 10px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          padding: 15px 20px;
          background: #020617;
          border-bottom: 1px solid #1e293b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .call-actions button {
          margin-left: 10px;
          background: #334155;
          border: none;
          border-radius: 50%;
          padding: 10px;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .loading {
          text-align: center;
          opacity: 0.6;
        }

        .chat-input {
          padding: 15px;
          background: #020617;
          display: flex;
          gap: 10px;
          border-top: 1px solid #1e293b;
        }

        .chat-input input {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #334155;
          background: #020617;
          color: white;
        }

        .chat-input button {
          background: #4f46e5;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }

        .empty-state {
          margin: auto;
          text-align: center;
          opacity: 0.7;
        }

        .call-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .modal-box {
          background: #020617;
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          border: 1px solid #4f46e5;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .accept {
          background: #22c55e;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }

        .reject {
          background: #ef4444;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
