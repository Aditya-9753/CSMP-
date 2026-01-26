import { useEffect, useRef, useState } from "react";

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const useCall = ({ sessionId }) => {
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const audioRef = useRef(null);
  const queueRef = useRef([]);

  const [callStatus, setCallStatus] = useState("idle"); // idle | calling | ringing | connected
  const [incomingCall, setIncomingCall] = useState(null);
  const [callId, setCallId] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [callType, setCallType] = useState("voice");

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  /* ================= SAFE SEND ================= */
  const safeSend = (payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      queueRef.current.push(payload);
    }
  };

  /* ================= AUDIO PLAY ================= */
  const playAudio = (stream) => {
    if (!audioRef.current) {
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.playsInline = true;
      audioRef.current = audio;
    }
    audioRef.current.srcObject = stream;
    audioRef.current.play().catch(() => {});
  };

  /* ================= WS ================= */
  useEffect(() => {
    if (!sessionId) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/call?session_id=${sessionId}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      // flush queued messages
      queueRef.current.forEach((msg) =>
        ws.send(JSON.stringify(msg))
      );
      queueRef.current = [];
    };

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        /* ---------- CALLER ACK ---------- */
        case "call:ack":
          setCallId(data.call_id);
          setPeerId(data.to);
          setCallType(data.call_type);
          setCallStatus("calling");

          await createPeer(data.to, data.call_type);

          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);

          safeSend({
            type: "call:offer",
            to: data.to,
            call_id: data.call_id,
            sdp: offer,
          });
          break;

        /* ---------- INCOMING ---------- */
        case "call:incoming":
          setIncomingCall(data);
          setCallId(data.call_id);
          setPeerId(data.from);
          setCallType(data.call_type);
          setCallStatus("ringing");
          break;

        /* ---------- OFFER ---------- */
        case "call:offer":
          await pcRef.current.setRemoteDescription(data.sdp);

          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);

          safeSend({
            type: "call:answer",
            to: data.from,
            call_id: callId,
            sdp: answer,
          });
          setCallStatus("connected");
          break;

        /* ---------- ANSWER ---------- */
        case "call:answer":
          await pcRef.current.setRemoteDescription(data.sdp);
          setCallStatus("connected");
          break;

        /* ---------- ICE ---------- */
        case "call:ice":
          if (data.candidate) {
            await pcRef.current.addIceCandidate(data.candidate);
          }
          break;

        /* ---------- END ---------- */
        case "call:end":
          cleanup();
          break;
      }
    };

    return () => ws.close();
  }, [sessionId, callId]);

  /* ================= PEER ================= */
  const createPeer = async (peer, type) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });

    setLocalStream(stream);

    const pc = new RTCPeerConnection(rtcConfig);
    pcRef.current = pc;

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      playAudio(e.streams[0]); // 🔊 voice guaranteed
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        safeSend({
          type: "call:ice",
          to: peer,
          call_id: callId,
          candidate: e.candidate,
        });
      }
    };
  };

  /* ================= START CALL ================= */
  const startCall = (to, type = "voice") => {
    setCallStatus("calling");
    safeSend({
      type: "call:init",
      to,
      call_type: type,
    });
  };

  /* ================= ACCEPT CALL ================= */
  const acceptCall = async () => {
    if (!incomingCall) return;

    await createPeer(incomingCall.from, incomingCall.call_type);

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    safeSend({
      type: "call:offer",
      to: incomingCall.from,
      call_id: callId,
      sdp: offer,
    });

    setIncomingCall(null);
  };

  /* ================= END CALL ================= */
  const endCall = () => {
    safeSend({
      type: "call:end",
      to: peerId,
      call_id: callId,
    });
    cleanup();
  };

  const cleanup = () => {
    pcRef.current?.close();
    localStream?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setCallId(null);
    setPeerId(null);
    setCallStatus("idle");
  };

  return {
    callStatus,
    incomingCall,
    localStream,
    remoteStream,
    callType,
    startCall,
    acceptCall,
    endCall,
  };
};

export default useCall;
