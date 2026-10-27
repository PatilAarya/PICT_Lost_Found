// STUB chip picker: ChipSelect { options, value, onChange, multi }.
// options: [{ value, label }]. With multi, value is an array; otherwise one value.
// Selected chips use aria-pressed so screen readers announce the state.

// Work out the new value after a chip is tapped.
function toggleValue(current, clicked, multi) {
  if (!multi) {
    return clicked;
  }
  const list = current || [];
  return list.includes(clicked) ? list.filter((item) => item !== clicked) : [...list, clicked];
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
          className="chip"
          aria-pressed={isSelected(option.value)}
          onClick={() => onChange(toggleValue(value, option.value, multi))}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
