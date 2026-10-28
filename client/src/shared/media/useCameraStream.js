// A small custom hook that wraps getUserMedia: the browser API that asks
// for camera permission and gives back a live video stream. Keeping this
// logic in its own hook keeps the camera screens (Found's CameraCapture.jsx and the
// shared PhotoPicker.jsx) focused on what to show, not how the camera works.
import { useRef, useState, useCallback, useEffect } from 'react';

// A plain-language message for each reason the browser can refuse the camera.
// getUserMedia rejects with a DOMException whose `name` says what went wrong.
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

  // Ask the browser for the back camera. facingMode: 'environment' prefers the rear
  // camera on a phone; a laptop simply uses its webcam.
  const start = useCallback(async () => {
    setError(null);
    // The camera only works on https or on localhost (a "secure context").
    if (!window.isSecureContext || !navigator.mediaDevices) {
      setError('The camera needs a secure page (https or localhost). Use Upload photos instead.');
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      // Showing the live view puts the <video> element on the page; the effect below
      // then connects the stream to it.
      setIsStreaming(true);
    } catch (err) {
      setError(cameraErrorMessage(err));
      setIsStreaming(false);
    }
  }, []);

  // The <video> element only exists once isStreaming is true, so we connect the stream
  // here, after React has drawn it. Before this fix the stream was attached too early,
  // when there was no <video> yet, and the live view stayed black.
  useEffect(() => {
    const video = videoRef.current;
    if (isStreaming && video && streamRef.current) {
      video.srcObject = streamRef.current;
      video.play().catch(() => {
        // Some browsers refuse autoplay until the person taps; the video is muted so
        // this is rare, and the Take photo button still works once a frame arrives.
      });
    }
  }, [isStreaming]);

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
