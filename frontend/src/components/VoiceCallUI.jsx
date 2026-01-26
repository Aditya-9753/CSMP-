import { useEffect, useRef } from "react";
import CallControls from "./CallControls";

export default function VoiceCallUI({ targetUser, status, remoteStream, onHangup, ...controls }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white">
      <h2 className="text-2xl">{targetUser}</h2>
      <p>{status}</p>

      <audio ref={audioRef} autoPlay />

      <CallControls onHangup={onHangup} isVideo={false} {...controls} />
    </div>
  );
}
