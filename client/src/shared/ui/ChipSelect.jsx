// Row of chips to pick one or more options.
import { Pictogram } from './Pictogram.jsx';

function toggleValue(current, clicked, multi) {
  if (!multi) {
    return clicked;
  }
  const list = current || [];
  return list.includes(clicked) ? list.filter((item) => item !== clicked) : [...list, clicked];
}

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
