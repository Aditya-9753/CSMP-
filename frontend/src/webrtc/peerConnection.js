import { RTC_CONFIG } from "../utils/constants";

export const createPeerConnection = (onIce, onTrack) => {
  const pc = new RTCPeerConnection(RTC_CONFIG);

  pc.onicecandidate = (e) => {
    if (e.candidate) onIce(e.candidate);
  };

  pc.ontrack = (e) => onTrack(e.streams[0]);

  return pc;
};
