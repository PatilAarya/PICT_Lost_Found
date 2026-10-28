// Chip picker: ChipSelect { options, value, onChange, multi }.
// options: [{ value, label, category?, swatch? }]. With multi, value is an array;
// otherwise one value. An option with `category` becomes a tile with the pictogram
// on top (category tiles); one with `swatch` shows a colour dot (used by ColorPicker).
// Selected chips use aria-pressed so screen readers announce the state.
import { Pictogram } from './Pictogram.jsx';

// Work out the new value after a chip is tapped.
function toggleValue(current, clicked, multi) {
  if (!multi) {
    return clicked;
  }
  const list = current || [];
  return list.includes(clicked) ? list.filter((item) => item !== clicked) : [...list, clicked];
}

// The small colour dot. "multicolor" has no single colour, so it shows three stripes.
function Swatch({ swatch }) {
  if (Array.isArray(swatch)) {
    return (
      <span className="swatch swatch-stripes" aria-hidden="true">
        {swatch.map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </span>
    );
  }
  return <span className="swatch" style={{ background: swatch }} aria-hidden="true" />;
}

export function ChipSelect({ options = [], value, onChange, multi = false }) {
  // Is this option currently chosen?
  function isSelected(optionValue) {
    return multi ? (value || []).includes(optionValue) : value === optionValue;
  }

  return (
    <div className="chips" role="group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.category ? 'chip chip-tile' : 'chip'}
          aria-pressed={isSelected(option.value)}
          onClick={() => onChange(toggleValue(value, option.value, multi))}
        >
          {option.category ? <Pictogram category={option.category} size={40} /> : null}
          {option.swatch ? <Swatch swatch={option.swatch} /> : null}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
