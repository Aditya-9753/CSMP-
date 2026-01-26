import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import apiClient from "../api/apiClient";

export default function History() {
  const { clientId } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chats"); // chats or calls
  const [historyData, setHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch History from Backend
  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        // Aapke historyApi endpoint ke hisaab se call
        const response = await apiClient.get(`/history/all`);
        setHistoryData(response.data || []);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [activeTab]);

  const filteredData = historyData.filter(item => 
    item.target_user?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="history-page">
      <header className="history-header">
        <button className="back-btn" onClick={() => navigate("/chat")}>← Back to Chat</button>
        <h1>Session Archives</h1>
        <div className="user-info">Logged in as: <strong>{clientId}</strong></div>
      </header>

      <div className="history-controls">
        <div className="tabs">
          <button 
            className={activeTab === "chats" ? "active" : ""} 
            onClick={() => setActiveTab("chats")}
          >
            Chat History
          </button>
          <button 
            className={activeTab === "calls" ? "active" : ""} 
            onClick={() => setActiveTab("calls")}
          >
            Call Logs
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Search by User ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      <div className="history-list">
        {loading ? (
          <div className="loading-state">Decrypting Archives...</div>
        ) : filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div key={index} className="history-item" onClick={() => navigate(`/chat`)}>
              <div className="item-icon">{activeTab === "chats" ? "💬" : "📞"}</div>
              <div className="item-details">
                <h3>{item.target_user}</h3>
                <p>{activeTab === "chats" ? item.last_message : `Duration: ${item.duration}`}</p>
              </div>
              <div className="item-meta">
                <span className="date">{new Date(item.timestamp).toLocaleDateString()}</span>
                <span className="time">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No records found in this vault.</div>
        )}
      </div>

      <style>{`
        .history-page {
          height: 100vh;
          background: #0f172a;
          color: white;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
        }

        .history-header {
          padding: 20px 40px;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #334155;
        }

        .back-btn { background: transparent; border: 1px solid #4f46e5; color: #818cf8; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .back-btn:hover { background: #4f46e5; color: white; }

        .history-controls {
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #111827;
        }

        .tabs { display: flex; gap: 10px; }
        .tabs button {
          padding: 10px 20px;
          background: #1e293b;
          border: none;
          color: #94a3b8;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }
        .tabs button.active { background: #4f46e5; color: white; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); }

        .search-bar {
          background: #1e293b;
          border: 1px solid #334155;
          padding: 10px 15px;
          border-radius: 8px;
          color: white;
          width: 250px;
          outline: none;
        }

        .history-list {
          flex: 1;
          padding: 20px 40px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .history-item {
          background: #1e293b;
          padding: 15px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
          cursor: pointer;
          transition: 0.2s;
          border: 1px solid transparent;
        }

        .history-item:hover {
          background: #334155;
          border-color: #4f46e5;
          transform: translateX(5px);
        }

        .item-icon { font-size: 1.5rem; background: #0f172a; padding: 10px; border-radius: 12px; }
        .item-details { flex: 1; }
        .item-details h3 { margin: 0; font-size: 1.1rem; }
        .item-details p { margin: 5px 0 0; font-size: 0.85rem; color: #94a3b8; }
        .item-meta { text-align: right; display: flex; flex-direction: column; gap: 5px; }
        .date { font-size: 0.8rem; font-weight: bold; }
        .time { font-size: 0.75rem; color: #64748b; }

        .loading-state, .empty-state { text-align: center; margin-top: 100px; color: #64748b; font-style: italic; }
      `}</style>
    </div>
  );
}