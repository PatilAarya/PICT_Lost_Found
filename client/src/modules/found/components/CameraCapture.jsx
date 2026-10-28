// Lets a finder take several photos of an item with the phone's camera,
// or choose files instead if the camera is not available. Each captured
// frame is drawn onto a hidden canvas (to turn live video into a still
// image) and then shrunk by resizeImage before being handed back to the
// parent form. The parent decides what happens next (blur step, upload).
import { useRef, useState } from 'react';
import { useCameraStream } from '../../../shared/media/useCameraStream.js';
import { resizeImage } from '../../../shared/media/resizeImage.js';
import { Button, Icon } from '../../../shared/ui/index.js';
import './CameraCapture.css';

const MAX_PHOTOS = 4;
// What each photo slot should show, in order (DESIGN brief: angle hints).
const ANGLE_HINTS = ['Front', 'Back', 'Close-up', 'Any mark or sticker'];

export default function CameraCapture({ photos, onPhotosChange }) {
  const { videoRef, isStreaming, error, start, stop } = useCameraStream();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  // Grabs the current video frame, shrinks it, and adds it to the list.
  async function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // videoWidth stays 0 until the first picture arrives from the camera.
    if (!video || !canvas || video.videoWidth === 0) return;

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

      {/* One slot per possible photo: filled slots show the photo, empty ones say what to shoot. */}
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
