// Suggests the item's colour from its photo and lets the finder accept it.
import { useEffect } from 'react';
import { ChipSelect, Spinner } from '../../../shared/ui/index.js';
import { useColorSuggestion } from '../hooks/useColorSuggestion.js';
import { COLORS } from '../../../shared/constants.js';

const COLOR_OPTIONS = COLORS.map((name) => ({ value: name, label: name }));

export default function ColorSuggestion({ firstPhotoBlob, value, onChange, onSuggestionReady }) {
  const { suggestion, loading } = useColorSuggestion(firstPhotoBlob);

  useEffect(() => {
    if (suggestion) {
      onSuggestionReady?.(suggestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion]);

  return (
    <div className="color-suggestion">
      {loading && <p className="color-suggestion__hint">Looking at the photo's colours...</p>}
      {!loading && suggestion && suggestion.colors.length > 0 && (
        <p className="color-suggestion__hint">
          Guess from the photo: {suggestion.colors.join(', ')}. Confirm or change it below.
        </p>
      )}
      <ChipSelect options={COLOR_OPTIONS} value={value} onChange={onChange} multi />
    </div>
  );
}
