// A small custom hook that wraps getUserMedia: the browser API that asks
// for camera permission and gives back a live video stream. Keeping this
// logic in its own hook keeps CameraCapture.jsx focused on what to show,
// not how the camera works.
import { useRef, useState, useCallback, useEffect } from 'react';

export function useCameraStream() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Ask the browser for the back camera and attach it to the <video>
  // element. facingMode: 'environment' prefers the rear camera on a
  // phone, which is the one people use to photograph a found item.
  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
    } catch {
      // Covers permission denied, no camera found, or an insecure
      // (non-https) origin. The component shows a file-picker fallback.
      setError('Camera is not available. You can choose a photo instead.');
      setIsStreaming(false);
    }
  }, []);

  // Stop every track so the camera light turns off and the browser
  // releases the device for other apps to use.
  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Safety net: stop the camera if the component unmounts while the
  // stream is still open, for example if the user navigates away.
  useEffect(() => stop, [stop]);

  return { videoRef, isStreaming, error, start, stop };
}