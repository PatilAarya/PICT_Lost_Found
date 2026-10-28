// Turns a match score into one plain sentence.
const ORDER = ['category', 'place', 'colour', 'text', 'time'];

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function whyThisMatch(breakdown) {
  const reasons = ORDER.map((key) => breakdown.find((factor) => factor.key === key))
    .filter((factor) => factor && factor.points > 0)
    .map((factor) => factor.detail);
  if (reasons.length === 0) {
    return 'Only a few things in common.';
  }
  return `${capitalise(reasons.join(', '))}.`;
}
