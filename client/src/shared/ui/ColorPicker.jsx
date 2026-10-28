// Colour picker: ColorPicker { value, onChange, multi }.
// It reuses ChipSelect with the contract COLORS list, so the values always match
// what the server accepts. Each chip shows a dot in that colour plus its name,
// so the choice never depends on seeing colour alone.
import { COLORS } from '../constants.js';
import { ChipSelect } from './ChipSelect.jsx';

// What each item colour looks like. These describe the item, not the app theme,
// so they are the only hex values outside tokens.css.
const SWATCHES = {
  black: '#1b1b1b',
  white: '#ffffff',
  grey: '#8a8f98',
  silver: '#c9ccd1',
  red: '#d62828',
  maroon: '#7a1f2b',
  orange: '#f28c28',
  yellow: '#f6d32d',
  green: '#3a9d4f',
  teal: '#2a9d8f',
  blue: '#2f6fd6',
  navy: '#1f2f5c',
  purple: '#7b4bb3',
  pink: '#f08bb4',
  brown: '#7b5232',
  beige: '#e3d3b0',
  gold: '#c9a227',
  multicolor: ['#d62828', '#f6d32d', '#2f6fd6'],
};

// "multicolor" reads better as "multicolour" for Indian English users.
function labelFor(color) {
  return color === 'multicolor' ? 'multicolour' : color;
}

const colorOptions = COLORS.map((color) => ({
  value: color,
  label: labelFor(color),
  swatch: SWATCHES[color],
}));

export function ColorPicker({ value, onChange, multi = true }) {
  return <ChipSelect options={colorOptions} value={value} onChange={onChange} multi={multi} />;
}
