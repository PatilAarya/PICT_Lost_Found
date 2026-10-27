// STUB colour picker: ColorPicker { value, onChange, multi }.
// It reuses ChipSelect with the contract COLORS list, so the values always match
// what the server accepts. Member 1 can add colour swatches later.
import { COLORS } from '../constants.js';
import { ChipSelect } from './ChipSelect.jsx';

const colorOptions = COLORS.map((color) => ({ value: color, label: color }));

export function ColorPicker({ value, onChange, multi = true }) {
  return <ChipSelect options={colorOptions} value={value} onChange={onChange} multi={multi} />;
}
