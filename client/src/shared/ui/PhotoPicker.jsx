// Picks one photo from the camera or the device.
import { useEffect, useRef, useState } from 'react';
import { useCameraStream } from '../media/useCameraStream.js';
import { resizeImage } from '../media/resizeImage.js';
import { Button } from './Button.jsx';
import { Icon } from './Icon.jsx';
import './photoPicker.css';

export function PhotoPicker({ photo, onChange }) {
  const { videoRef, isStreaming, error, start, stop } = useCameraStream();
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function takePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(
      async (blob) => {
        stop();
        onChange(await resizeImage(blob));
      },
      'image/jpeg',
      0.9
    );
  }

  async function handleFile(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (file) onChange(await resizeImage(file));
  }

  if (previewUrl) {
    return (
      <div className="photo-picker-preview">
        <img src={previewUrl} alt="Your photo of the item" />
        <Button variant="quiet" icon="trash" onClick={() => onChange(null)}>
          Remove photo
        </Button>
      </div>
    );
  }

  if (isStreaming) {
    return (
      <div className="photo-picker-live">
        <video ref={videoRef} playsInline muted aria-label="Camera preview" />
        <canvas ref={canvasRef} hidden />
        <div className="button-row">
          <Button icon="camera" onClick={takePhoto}>
            Take photo
          </Button>
          <Button variant="quiet" icon="close" onClick={stop}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-picker">
      <div className="photo-picker-options">
        <button type="button" className="photo-option" onClick={start}>
          <Icon name="camera" size={28} />
          <strong>Take a photo</strong>
        </button>
        <button type="button" className="photo-option" onClick={() => fileRef.current.click()}>
          <Icon name="upload" size={28} />
          <strong>Upload a photo</strong>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
