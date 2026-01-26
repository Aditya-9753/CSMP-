import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/apiClient";

export default function Register() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const trimmedId = userId.trim();
    if (!trimmedId) {
      alert("User ID is required");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/handshake/register", {
        user_id: trimmedId, // ✅ MUST match backend
      });

      console.log("REGISTER SUCCESS:", res.data);

      alert(`✅ Identity "${trimmedId}" created successfully!`);
      navigate("/login");
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      if (err.response?.status === 409) {
        alert("❌ This ID already exists. Try another one.");
      } else {
        alert(err.response?.data?.detail || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        {/* LEFT SIDE */}
        <div className="auth-left reg-side">
          <div className="brand-content">
            <h1>JOIN</h1>
            <p>
              Create your unique CSMP identity for secure,
              end-to-end encrypted messaging.
            </p>
          </div>

          <div className="feat-badges">
            <span>🛡️ Secure</span>
            <span>⚡ Fast</span>
            <span>🔑 Encrypted</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">
          <h2>Create Identity</h2>
          <p className="subtitle">Join the CSMP secure network.</p>

          <form onSubmit={handleRegister}>
            <div className="input-field">
              <label>New Client ID</label>
              <input
                type="text"
                placeholder="Unique username (e.g. adi_01)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="reg-btn" disabled={loading}>
              {loading ? "Generating Identity..." : "Create Account"}
            </button>
          </form>

          <p className="switch-text">
            Already have an identity? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-container {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          font-family: 'Inter', sans-serif;
        }

        .auth-box {
          display: flex;
          width: 850px;
          min-height: 500px;
          background: #1e293b;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .auth-left {
          flex: 1;
          padding: 50px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .reg-side {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .brand-content h1 {
          font-size: 3.5rem;
          margin: 0;
        }

        .feat-badges span {
          background: rgba(255,255,255,0.2);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
        }

        .auth-right {
          flex: 1.2;
          padding: 50px;
          background: #1e293b;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-right h2 {
          color: white;
        }

        .subtitle {
          color: #94a3b8;
          margin-bottom: 30px;
        }

        .input-field {
          margin-bottom: 25px;
        }

        .input-field label {
          color: #cbd5e1;
          font-size: 0.85rem;
        }

        .input-field input {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: 1px solid #334155;
          background: #0f172a;
          color: white;
        }

        .reg-btn {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          background: #10b981;
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .reg-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .switch-text {
          margin-top: 25px;
          text-align: center;
          color: #94a3b8;
        }

        .switch-text a {
          color: #10b981;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .auth-box {
            flex-direction: column;
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
}
