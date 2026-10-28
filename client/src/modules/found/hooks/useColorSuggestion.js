// Hook that runs the colour guess on a photo.
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
