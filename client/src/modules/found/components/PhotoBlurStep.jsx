// Goes through each photo so the finder can blur it.
import { useState } from 'react';
import PhotoBlurEditor from './PhotoBlurEditor.jsx';

export default function PhotoBlurStep({ photos, onAllConfirmed }) {
  const [confirmedById, setConfirmedById] = useState({});
  const currentPhoto = photos.find((photo) => !confirmedById[photo.id]);

  function handleConfirm(result) {
    const next = { ...confirmedById, [result.id]: result };
    setConfirmedById(next);
    if (Object.keys(next).length === photos.length) {
      onAllConfirmed(photos.map((photo) => next[photo.id]));
    }
  }

  if (!currentPhoto) return null;

  const doneCount = Object.keys(confirmedById).length;

  return (
    <div className="photo-blur-step">
      <p className="step-label tabular">
        Photo {doneCount + 1} of {photos.length}
      </p>
      <PhotoBlurEditor key={currentPhoto.id} photo={currentPhoto} onConfirm={handleConfirm} />
    </div>
  );
}
