    export const signaling = {
  // Offer bhejna (Call initiate karna)
  sendOffer: async (pc, targetUserId, socket) => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.send(JSON.stringify({
      type: "make_call",
      to: targetUserId,
      offer: offer
    }));
  },

  // Answer bhejna (Call uthana)
  sendAnswer: async (pc, targetUserId, offer, socket) => {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.send(JSON.stringify({
      type: "accept_call",
      to: targetUserId,
      answer: answer
    }));
  },

  // Network rasta (ICE Candidate) bhejna
  sendIceCandidate: (candidate, targetUserId, socket) => {
    socket.send(JSON.stringify({
      type: "ice_candidate",
      to: targetUserId,
      candidate: candidate
    }));
  }
};