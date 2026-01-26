import { useEffect, useRef } from "react";
import CallControls from "./CallControls";

export default function VideoCallUI({
  targetUser,
  localStream,
  remoteStream,
  onHangup,
  ...controls
}) {
  const remoteRef = useRef(null);
  const localRef = useRef(null);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="relative w-full h-full bg-black">
      <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />

      <div className="absolute top-4 right-4 w-40 h-28">
        <video ref={localRef} autoPlay muted className="w-full h-full object-cover" />
      </div>

      <div className="absolute bottom-8 w-full flex justify-center">
        <CallControls onHangup={onHangup} isVideo {...controls} />
      </div>
    </div>
  );
}
