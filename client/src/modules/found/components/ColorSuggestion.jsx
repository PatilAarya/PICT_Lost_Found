// Shows the on-device colour guess for the found item's first photo, and
// lets the finder accept it or pick different colours instead. The guess
// is never saved as the item's real colour; whatever the finder confirms
// here becomes the final "colors" field, while the raw guess is kept
// separately as aiSuggestion so it is clear it was only ever a hint.
import { useEffect } from 'react';
import { ChipSelect, Spinner } from '../../../shared/ui/index.js';
import { useColorSuggestion } from '../hooks/useColorSuggestion.js';
import { COLORS } from '../../../shared/constants.js';

const COLOR_OPTIONS = COLORS.map((name) => ({ value: name, label: name }));

export default function ColorSuggestion({ firstPhotoBlob, value, onChange, onSuggestionReady }) {
  const { suggestion, loading } = useColorSuggestion(firstPhotoBlob);

  // Report the raw guess up to the parent form once per photo, so it
  // can be saved in aiSuggestion alongside the finder's final choice.
  useEffect(() => {
    if (suggestion) {
      onSuggestionReady?.(suggestion);
    }
    // onSuggestionReady is a stable callback from the parent; only
    // re-run this when the guess itself actually changes.
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