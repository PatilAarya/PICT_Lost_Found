// Small pure helpers for the PropertyTag stub: split a serial number into its parts
// and turn its digits into barcode bars. Kept apart from the component so they are
// easy to unit-test and to explain. Used only by PropertyTag.jsx.

// "PICT-L-000045" becomes { prefix: 'PICT', letter: 'L', number: '000045' }.
// If the serial is missing or odd, fall back to the item kind and dashes.
export function splitSerial(serial, kind) {
  const parts = String(serial || '').split('-');
  if (parts.length === 3) {
    return { prefix: parts[0], letter: parts[1], number: parts[2] };
  }
  const letter = kind === 'found' ? 'F' : 'L';
  return { prefix: 'PICT', letter, number: '------' };
}

// Decorative barcode bars built from the real digits of the serial number.
// Each digit picks a bar width of 1, 2 or 3 units (digit % 3 + 1), with a gap after it,
// so every ticket gets its own pattern. It is not a scannable barcode.
export function barcodeBars(number) {
  const bars = [];
  let x = 0;
  for (const character of String(number)) {
    const digit = Number(character);
    if (Number.isNaN(digit)) {
      continue;
    }
    const width = (digit % 3) + 1;
    bars.push({ x, width });
    x = x + width + 1.5;
  }
  return { bars, totalWidth: Math.max(x - 1.5, 1) };
}
