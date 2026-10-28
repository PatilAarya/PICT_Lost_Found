// Draws the pictogram for an item category.
import { PICTOGRAM_SHAPES } from './pictograms/shapes.jsx';
import './pictograms/pictogram.css';

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
