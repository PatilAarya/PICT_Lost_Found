// Helpers for the ticket's serial number and barcode.
export function splitSerial(serial, kind) {
  const parts = String(serial || '').split('-');
  if (parts.length === 3) {
    return { prefix: parts[0], letter: parts[1], number: parts[2] };
  }
  const letter = kind === 'found' ? 'F' : 'L';
  return { prefix: 'PICT', letter, number: '------' };
}

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
