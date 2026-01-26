export default function MessageBubble({ message, isMe, timestamp }) {
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`bubble-wrapper ${isMe ? 'me' : 'them'}`}>
      <div className="bubble">
        <p>{message}</p>
        <span className="time">{time}</span>
      </div>
      
      <style>{`
        .bubble-wrapper { display: flex; width: 100%; margin-bottom: 4px; }
        .bubble-wrapper.me { justify-content: flex-end; }
        .bubble-wrapper.them { justify-content: flex-start; }
        
        .bubble { 
          max-width: 70%; 
          padding: 10px 14px; 
          border-radius: 15px; 
          position: relative;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .me .bubble { background: #4f46e5; color: white; border-bottom-right-radius: 2px; }
        .them .bubble { background: #334155; color: white; border-bottom-left-radius: 2px; }
        
        .bubble p { margin: 0; font-size: 0.95rem; line-height: 1.4; }
        .time { font-size: 0.65rem; color: #cbd5e1; display: block; text-align: right; margin-top: 4px; opacity: 0.7; }
      `}</style>
    </div>
  );
} 