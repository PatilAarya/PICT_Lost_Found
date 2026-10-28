// Turns a tap on the plan into a position and a room.
function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function round3(value) {
  return Math.round(value * 1000) / 1000;
}

export function pointToFraction(clientX, clientY, box) {
  const x = (clientX - box.left) / box.width;
  const y = (clientY - box.top) / box.height;
  return { x: round3(clamp01(x)), y: round3(clamp01(y)) };
}

export function areaFromTarget(target, areas) {
  const element = target && target.closest ? target.closest('.area') : null;
  if (!element) return '';
  return areas.some((area) => area.id === element.id) ? element.id : '';
}
