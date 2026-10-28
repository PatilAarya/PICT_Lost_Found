// Steps the finder through blurring each captured photo, one at a time,
// and collects the result: a public (possibly blurred) blob and the
// untouched private original, for every photo. Hands the full list to
// the parent form once every photo has been confirmed.
import { useState } from 'react';
import PhotoBlurEditor from './PhotoBlurEditor.jsx';

export default function PhotoBlurStep({ photos, onAllConfirmed }) {
  const [confirmedById, setConfirmedById] = useState({});
  const currentPhoto = photos.find((photo) => !confirmedById[photo.id]);

  // Saves one photo's result and checks whether every photo is now done.
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
