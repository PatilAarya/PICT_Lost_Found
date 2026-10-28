// The maths behind dropping a pin on a floor plan, kept apart so it is easy to test.
// A tap gives screen pixels (clientX, clientY). The plan's box on screen comes from
// getBoundingClientRect(). Subtracting the box's left/top and dividing by its width/height
// turns the tap into a fraction from 0 to 1, which works at any screen or zoom size.

// Keep a number between 0 and 1 (a tap on the very edge can give -0.001 or 1.002).
function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

// Round to 3 decimals: 0.4567891 -> 0.457, precise enough for a pin.
function round3(value) {
  return Math.round(value * 1000) / 1000;
}

// Turn a tap position into { x, y } fractions of the plan's box.
export function pointToFraction(clientX, clientY, box) {
  const x = (clientX - box.left) / box.width;
  const y = (clientY - box.top) / box.height;
  return { x: round3(clamp01(x)), y: round3(clamp01(y)) };
}

// Which room was tapped: the nearest element with class "area" around the tap target,
// as long as its id is one of this floor's areas. Returns the area id or ''.
export function areaFromTarget(target, areas) {
  const element = target && target.closest ? target.closest('.area') : null;
  if (!element) return '';
  return areas.some((area) => area.id === element.id) ? element.id : '';
}
