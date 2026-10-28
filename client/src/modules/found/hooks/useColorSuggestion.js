// Runs the on-device colour guess (detectColors) whenever a photo is
// given, and exposes loading/result state to the post-found-item form.
// Kept separate from CameraCapture so the camera component does not
// need to know anything about colour detection.
import { useEffect, useState } from 'react';
import { detectColors } from '../utils/detectColor.js';

export function useColorSuggestion(photoBlob) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!photoBlob) {
      setSuggestion(null);
      return;
    }
    let cancelled = false;
    setLoading(true);

    detectColors(photoBlob).then((result) => {
      // If a newer photo arrived before this finished, ignore this
      // result so it cannot overwrite a more recent one.
      if (!cancelled) {
        setSuggestion(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [photoBlob]);

  return { suggestion, loading };
}
