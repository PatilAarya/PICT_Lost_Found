// Category pictogram: Pictogram { category, size }. Draws one of the 10 custom SVGs
// from pictograms/shapes.jsx; an unknown category falls back to "other".
// The small detail is red on lost tickets and steel on found ones: PropertyTag sets
// the CSS variable --pg-detail, so this component needs no lost/found prop.
import { PICTOGRAM_SHAPES } from './pictograms/shapes.jsx';
import './pictograms/pictogram.css';

// "id_card" becomes "id card" for screen readers.
function labelFor(category) {
  return String(category).replaceAll('_', ' ');
}

export function Pictogram({ category, size = 48 }) {
  const known = PICTOGRAM_SHAPES[category] ? category : 'other';
  const Shape = PICTOGRAM_SHAPES[known];
  return (
    <svg
      className="pictogram"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={labelFor(known)}
    >
      <Shape />
    </svg>
  );
}
