// Takes photos with the camera or picks files from the device.
import { useRef, useState } from 'react';
import { useCameraStream } from '../../../shared/media/useCameraStream.js';
import { resizeImage } from '../../../shared/media/resizeImage.js';
import { Button, Icon } from '../../../shared/ui/index.js';
import './CameraCapture.css';

const MAX_PHOTOS = 4;
const ANGLE_HINTS = ['Front', 'Back', 'Close-up', 'Any mark or sticker'];

export default function CameraCapture({ photos, onPhotosChange }) {
  const { videoRef, isStreaming, error, start, stop } = useCameraStream();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    setBusy(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(
      async (rawBlob) => {
        const smallBlob = await resizeImage(rawBlob);
        addPhoto(smallBlob);
        setBusy(false);
      },
      'image/jpeg',
      0.9
    );
  }

  function addPhoto(blob) {
    const photo = { id: crypto.randomUUID(), blob, previewUrl: URL.createObjectURL(blob) };
    onPhotosChange([...photos, photo]);
  }

  async function handleFileChosen(event) {
    const files = Array.from(event.target.files).slice(0, MAX_PHOTOS - photos.length);
    for (const file of files) {
      const smallBlob = await resizeImage(file);
      addPhoto(smallBlob);
    }
    event.target.value = '';
  }

  function removePhoto(id) {
    const photo = photos.find((item) => item.id === id);
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    onPhotosChange(photos.filter((item) => item.id !== id));
  }

  const reachedLimit = photos.length >= MAX_PHOTOS;

  return (
    <div className="camera-capture">
      {isStreaming && (
        <div className="camera-capture__live">
          <video
            ref={videoRef}
            className="camera-capture__video"
            playsInline
            muted
            aria-label="Camera preview"
          />
          <canvas ref={canvasRef} className="camera-capture__hidden-canvas" />
          <div className="camera-capture__live-actions">
            <Button
              variant="primary"
              size="lg"
              icon="camera"
              loading={busy}
              onClick={capturePhoto}
              disabled={reachedLimit}
            >
              Take photo
            </Button>
            <Button variant="quiet" size="lg" icon="close" onClick={stop}>
              Done
            </Button>
          </div>
        </div>
      )}

      {!isStreaming && (
        <div className="capture-options">
          <button type="button" className="capture-option" onClick={start} disabled={reachedLimit}>
            <Icon name="camera" size={32} />
            <strong>Take photos</strong>
            <span>Use this device's camera</span>
          </button>
          <button
            type="button"
            className="capture-option"
            onClick={() => fileInputRef.current.click()}
            disabled={reachedLimit}
          >
            <Icon name="upload" size={32} />
            <strong>Upload photos</strong>
            <span>Choose from your gallery or files</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChosen}
          />
        </div>
      )}
      {error && <p className="camera-capture__error">{error}</p>}

      <ul className="camera-capture__thumbs">
        {ANGLE_HINTS.map((hint, index) => {
          const photo = photos[index];
          if (!photo) {
            return (
              <li key={hint} className="camera-capture__slot">
                <span className="tabular">{index + 1}</span>
                <span>{hint}</span>
              </li>
            );
          }
          return (
            <li key={photo.id} className="camera-capture__thumb">
              <img src={photo.previewUrl} alt={`Photo ${index + 1} of the found item`} />
              <button
                type="button"
                className="camera-capture__remove"
                aria-label={`Remove photo ${index + 1}`}
                onClick={() => removePhoto(photo.id)}
              >
                <Icon name="trash" size={18} />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="camera-capture__count tabular">
        {photos.length} of {MAX_PHOTOS} photos added
      </p>
    </div>
  );
}
