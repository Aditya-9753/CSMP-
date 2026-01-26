import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { startHandshake } from '../api/handshakeApi';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveSession } = useSession();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await startHandshake(userId);
      saveSession({
        session_id: data.session_id,
        client_id: userId
      });
      navigate('/chat');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-left">
          <h1>CSMP</h1>
          <p>Secure Handshake Protocol</p>
          <div className="status-indicator">
            <span className="dot"></span> Online & Encrypted
          </div>
        </div>
        <div className="auth-right">
          <h2>Welcome Back</h2>
          <form onSubmit={handleLogin}>
            <div className="input-field">
              <label>Client Identity</label>
              <input 
                type="text" 
                placeholder="Enter your ID..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Establishing Handshake..." : "Sign In"}
            </button>
          </form>
          <p className="switch-text">
            Don't have an ID? <Link to="/register">Create Identity</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; }
        .auth-box { display: flex; width: 800px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
        .auth-left { flex: 1; padding: 50px; background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); display: flex; flex-direction: column; justify-content: center; }
        .auth-left h1 { font-size: 3rem; margin: 0; color: white; letter-spacing: 4px; }
        .auth-left p { color: #c7d2fe; margin-top: 10px; }
        .status-indicator { margin-top: 30px; font-size: 0.8rem; color: #4ade80; display: flex; align-items: center; gap: 8px; }
        .dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 10px #4ade80; }
        .auth-right { flex: 1.2; padding: 50px; background: #1e293b; color: white; }
        .auth-right h2 { margin-bottom: 30px; font-weight: 500; }
        .input-field { margin-bottom: 20px; }
        .input-field label { display: block; margin-bottom: 8px; color: #94a3b8; font-size: 0.85rem; }
        .input-field input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #334155; background: #0f172a; color: white; outline: none; }
        .input-field input:focus { border-color: #6366f1; }
        .login-btn { width: 100%; padding: 14px; border-radius: 10px; border: none; background: #4f46e5; color: white; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .login-btn:hover { background: #4338ca; transform: translateY(-2px); }
        .login-btn:disabled { opacity: 0.6; }
        .switch-text { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 0.9rem; }
        .switch-text a { color: #818cf8; text-decoration: none; font-weight: bold; }
      `}</style>
    </div>
  );
}