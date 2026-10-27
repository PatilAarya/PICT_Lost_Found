// Lets a finder take several photos of an item with the phone's camera,
// or choose files instead if the camera is not available. Each captured
// frame is drawn onto a hidden canvas (to turn live video into a still
// image) and then shrunk by resizeImage before being handed back to the
// parent form. The parent decides what happens next (blur step, upload).
import { useRef, useState } from 'react';
import { useCameraStream } from '../hooks/useCameraStream.js';
import { resizeImage } from '../utils/resizeImage.js';
import { Button, Icon } from '../../../shared/ui/index.js';
import './CameraCapture.css';

const MAX_PHOTOS = 4;

export default function CameraCapture({ photos, onPhotosChange }) {
  const { videoRef, isStreaming, error, start, stop } = useCameraStream();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  // Grabs the current video frame, shrinks it, and adds it to the list.
  async function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setBusy(true);
    // Draw at the video's real resolution first; resizeImage shrinks it
    // afterwards. Drawing straight from <video> onto <canvas> is how the
    // browser turns a moving stream into one still picture.
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

  // Shared by both the camera and the file-picker fallback, so a photo
  // looks the same to the rest of the app no matter how it was taken.
  function addPhoto(blob) {
    const photo = { id: crypto.randomUUID(), blob, previewUrl: URL.createObjectURL(blob) };
    onPhotosChange([...photos, photo]);
  }

  // Handles the <input type="file"> fallback for browsers without a camera.
  async function handleFileChosen(event) {
    const files = Array.from(event.target.files).slice(0, MAX_PHOTOS - photos.length);
    for (const file of files) {
      const smallBlob = await resizeImage(file);
      addPhoto(smallBlob);
    }
    event.target.value = '';
  }

  // Removes one photo and frees its preview URL so the browser can
  // release the memory it was using to show the thumbnail.
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
        <div className="camera-capture__start">
          <Button variant="primary" size="lg" icon="camera" onClick={start} disabled={reachedLimit}>
            Open camera
          </Button>
          <Button
            variant="quiet"
            size="lg"
            icon="upload"
            onClick={() => fileInputRef.current.click()}
            disabled={reachedLimit}
          >
            Choose photo instead
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            hidden
            onChange={handleFileChosen}
          />
          {error && <p className="camera-capture__error">{error}</p>}
        </div>
      )}

      {photos.length > 0 && (
        <ul className="camera-capture__thumbs">
          {photos.map((photo) => (
            <li key={photo.id} className="camera-capture__thumb">
              <img src={photo.previewUrl} alt="Photo of the found item" />
              <button
                type="button"
                className="camera-capture__remove"
                aria-label="Remove this photo"
                onClick={() => removePhoto(photo.id)}
              >
                <Icon name="trash" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="camera-capture__count">
        {photos.length} of {MAX_PHOTOS} photos added
      </p>
    </div>
  );
}
