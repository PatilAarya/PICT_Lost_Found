// Hook that opens the camera and gives a live video stream.
import { useRef, useState, useCallback, useEffect } from 'react';

function cameraErrorMessage(err) {
  if (err.name === 'NotAllowedError') {
    return 'Camera permission is blocked. Click the camera icon in the address bar, allow it, then try again.';
  }
  if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
    return 'No camera was found on this device. Use Upload photos instead.';
  }
  if (err.name === 'NotReadableError') {
    return 'The camera is busy in another app or tab (for example Zoom, Teams or another browser tab). Close it and try again.';
  }
  return 'The camera could not start. Use Upload photos instead.';
}

export function useCameraStream() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const start = useCallback(async () => {
    setError(null);
    if (!window.isSecureContext || !navigator.mediaDevices) {
      setError('The camera needs a secure page (https or localhost). Use Upload photos instead.');
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setIsStreaming(true);
    } catch (err) {
      setError(cameraErrorMessage(err));
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (isStreaming && video && streamRef.current) {
      video.srcObject = streamRef.current;
      video.play().catch(() => {});
    }
  }, [isStreaming]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => stop, [stop]);

  return { videoRef, isStreaming, error, start, stop };
}
