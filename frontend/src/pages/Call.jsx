import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import useCall from "../hooks/useCall";

export default function Call() {
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const targetUser = query.get("target");
  const callType = query.get("type") || "video"; // voice | video

  const {
    localStream,
    remoteStream,
    callStatus,
    incomingCall,
    startCall,
    acceptCall,
    endCall,
  } = useCall({ sessionId });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  /* ================= START CALL (CALLER ONLY) ================= */
  useEffect(() => {
    if (targetUser) {
      startCall(targetUser, callType);
    }
  }, [targetUser]);

  /* ================= ATTACH STREAMS ================= */
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  /* ================= CONTROLS ================= */
  const toggleMute = () => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = muted;
    setMuted(!muted);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = videoOff;
    setVideoOff(!videoOff);
  };

  const hangup = () => {
    endCall();
    navigate("/chat");
  };

  /* ================= INCOMING CALL SCREEN ================= */
  if (incomingCall && callStatus === "ringing") {
    return (
      <div className="call-root">
        <div className="call-header">
          <h2>
            📞 Incoming {incomingCall.call_type} call from{" "}
            <span>{incomingCall.from}</span>
          </h2>
        </div>

        <div className="controls">
          <button className="ctrl" onClick={acceptCall}>✅</button>
          <button className="ctrl end" onClick={hangup}>❌</button>
        </div>
      </div>
    );
  }

  return (
    <div className="call-root">
      {/* ================= STATUS BAR ================= */}
      <div className="call-header">
        <span className="badge">{callStatus.toUpperCase()}</span>
        <h2>
          {callType === "video" ? "📹 Video Call" : "📞 Voice Call"} with{" "}
          <span>{targetUser || incomingCall?.from}</span>
        </h2>
      </div>

      {/* ================= VIDEO / VOICE AREA ================= */}
      <div className="video-area">
        {/* VIDEO */}
        {callType === "video" && remoteStream && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
        )}

        {/* VOICE */}
        {callType === "voice" && callStatus === "connected" && (
          <div className="waiting">
            <h2 style={{ color: "#22c55e" }}>🎧 Voice Call Active</h2>
          </div>
        )}

        {/* WAITING */}
        {!remoteStream && callStatus !== "connected" && (
          <div className="waiting">
            <div className="loader"></div>
            <p>Connecting securely…</p>
          </div>
        )}

        {/* LOCAL PREVIEW */}
        {callType === "video" && localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />
        )}
      </div>

      {/* ================= CONTROLS ================= */}
      <div className="controls">
        <button
          className={`ctrl ${muted ? "active" : ""}`}
          onClick={toggleMute}
        >
          {muted ? "🔇" : "🎤"}
        </button>

        {callType === "video" && (
          <button
            className={`ctrl ${videoOff ? "active" : ""}`}
            onClick={toggleVideo}
          >
            {videoOff ? "🎥 Off" : "📷"}
          </button>
        )}

        <button className="ctrl end" onClick={hangup}>
          ⛔
        </button>
      </div>

      {/* ================= CSS ================= */}
      <style>{`
        .call-root {
          height: 100vh;
          background: #020617;
          color: white;
          display: flex;
          flex-direction: column;
          font-family: Inter, system-ui;
        }

        .call-header {
          padding: 20px;
          text-align: center;
          background: rgba(15,23,42,0.9);
          border-bottom: 1px solid #1e293b;
        }

        .call-header h2 span {
          color: #6366f1;
        }

        .badge {
          display: inline-block;
          background: #4f46e5;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          margin-bottom: 6px;
        }

        .video-area {
          flex: 1;
          position: relative;
          background: black;
        }

        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .local-video {
          position: absolute;
          bottom: 110px;
          right: 20px;
          width: 220px;
          height: 150px;
          border-radius: 14px;
          border: 2px solid #6366f1;
          object-fit: cover;
          background: black;
        }

        .waiting {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .loader {
          width: 40px;
          height: 40px;
          border: 4px solid #1e293b;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .controls {
          height: 100px;
          background: rgba(15,23,42,0.95);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 30px;
          border-top: 1px solid #1e293b;
        }

        .ctrl {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          background: #334155;
          font-size: 1.3rem;
          cursor: pointer;
          transition: 0.2s;
        }

        .ctrl:hover {
          transform: scale(1.1);
        }

        .ctrl.active {
          background: #ef4444;
        }

        .ctrl.end {
          background: #ef4444;
          transform: rotate(135deg);
          width: 70px;
          height: 70px;
        }

        .ctrl.end:hover {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}
