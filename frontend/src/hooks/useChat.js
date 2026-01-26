import { useState, useEffect, useRef } from "react";
import { useSession } from "./useSession"; // Agar logout trigger karna ho

export default function useChat(roomId, sessionId) {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const { clearSession } = useSession(); // Session expire hone par use karne ke liye

  // Room change hote hi messages clear karne ke liye logic
  useEffect(() => {
    setMessages([]);
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !sessionId) return;

    const wsUrl = `ws://localhost:8000/ws/chat?session_id=${sessionId}&room_id=${roomId}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`✅ Connected to room: ${roomId}`);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Backend ke message format ke hisaab se check karein (data.message ya data.content)
        if (data.type === "chat" || data.message) {
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };

    socket.onclose = (event) => {
      console.warn("⚠️ WebSocket Closed:", event.reason);
      
      // 🔥 ERROR FIX: Agar server session bhool gaya hai (403/Forbidden)
      if (event.code === 4003 || event.reason.includes("NOT FOUND")) {
        alert("Session expired. Please login again.");
        clearSession(); // LocalStorage saaf karo aur login pe bhejo
        window.location.href = "/login";
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [roomId, sessionId, clearSession]);

  const send = (text) => {
    if (!text.trim()) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const payload = {
        type: "chat",
        message: text,
        timestamp: new Date().toISOString() // Local timestamp for immediate UI feel
      };
      socketRef.current.send(JSON.stringify(payload));
    } else {
      console.error("WebSocket is not open. State:", socketRef.current?.readyState);
      alert("Connection lost. Trying to reconnect...");
    }
  };

  return { 
    messages, 
    setMessages, // History load karte waqt kaam aayega
    send, 
    clearMessages: () => setMessages([]) 
  };
}