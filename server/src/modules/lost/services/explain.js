// "Why this match": turns a score breakdown into one plain sentence, for example
// "Same category, same building, found 2 hours after you lost it."
// Only factors that earned points are mentioned, so every word is backed by real data.
// Used by the match routes and by the MATCH_FOUND notification.

// Strong factors first, so the sentence leads with the best reasons.
const ORDER = ['category', 'place', 'colour', 'text', 'time'];

// "same category" -> "Same category".
function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Build the sentence from a breakdown: [{ key, points, max, detail }].
export function whyThisMatch(breakdown) {
  const reasons = ORDER.map((key) => breakdown.find((factor) => factor.key === key))
    .filter((factor) => factor && factor.points > 0)
    .map((factor) => factor.detail);
  if (reasons.length === 0) {
    return 'Only a few things in common.';
  }
  return `${capitalise(reasons.join(', '))}.`;
}
