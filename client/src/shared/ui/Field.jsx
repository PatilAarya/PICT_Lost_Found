// Form field pieces: Field { label, hint, error } wraps one input, and
// TextInput, TextArea and SelectInput are plain inputs styled the same way.
// useId() links the label and messages to the input for screen readers.
// An error replaces the hint and shows a pin icon, so it is not shown by colour alone.
import { cloneElement, useId } from 'react';
import { Icon } from './Icon.jsx';

// A label above, the input, then a hint or an error below.
export function Field({ label, hint, error, children }) {
  const id = useId();
  const messageId = `${id}-message`;
  const input = cloneElement(children, {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': hint || error ? messageId : undefined,
  });
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {input}
      {error ? (
        <p id={messageId} className="field-error">
          <Icon name="pin" size={18} />
          <span>{error}</span>
        </p>
      ) : null}
      {!error && hint ? (
        <p id={messageId} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// A one-line text input.
export function TextInput(props) {
  return <input className="input" {...props} />;
}

// A multi-line text input.
export function TextArea(props) {
  return <textarea className="input" rows={4} {...props} />;
}

// A dropdown. options: [{ value, label }].
export function SelectInput({ options = [], ...rest }) {
  return (
    <select className="input" {...rest}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
