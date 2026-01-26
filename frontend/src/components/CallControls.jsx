export default function CallControls({
  onHangup,
  onMute,
  onCamera,
  onScreenShare,
  isMuted,
  isCameraOff,
  isScreenSharing,
  isVideo
}) {
  return (
    <div className="flex gap-6 bg-slate-900/80 px-6 py-4 rounded-full">
      <button onClick={onMute} className={`w-14 h-14 rounded-full ${isMuted ? "bg-red-600" : "bg-slate-700"}`}>🎙️</button>

      {isVideo && (
        <button onClick={onCamera} className={`w-14 h-14 rounded-full ${isCameraOff ? "bg-red-600" : "bg-slate-700"}`}>🎥</button>
      )}

      {isVideo && (
        <button onClick={onScreenShare} className={`w-14 h-14 rounded-full ${isScreenSharing ? "bg-indigo-600" : "bg-slate-700"}`}>🖥️</button>
      )}

      <button onClick={onHangup} className="w-14 h-14 rounded-full bg-red-700">❌</button>
    </div>
  );
}
