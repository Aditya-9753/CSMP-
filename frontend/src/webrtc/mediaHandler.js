export const getMediaStream = async (type = 'video') => {
  try {
    const constraints = {
      audio: true,
      video: type === 'video' ? { width: 1280, height: 720 } : false
    };
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    console.error("Media Access Error:", err);
    throw err;
  }
};