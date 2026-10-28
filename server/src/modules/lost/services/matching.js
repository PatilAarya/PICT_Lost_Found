// The match engine: how likely is it that a found item is the lost one?
// score(lostReport, foundItem) adds five factors, out of 100:
//   category 40, colour 15, text 20, place 15, time 10.
// A different category rejects the pair (unless one side is "other"). Pairs scoring at
// least MIN_TOTAL are kept as matches. Pure functions: no database, easy to test.
import { itemText, jaccard, sharedWords, tokenise } from './textSimilarity.js';

export const MIN_TOTAL = 45;
const HOUR_MS = 60 * 60 * 1000;

// Category: 40 for the same one, 20 when one side is "other", else the pair is rejected.
export function scoreCategory(lostCategory, foundCategory) {
  if (lostCategory === foundCategory) {
    return { key: 'category', points: 40, max: 40, detail: 'same category' };
  }
  if (lostCategory === 'other' || foundCategory === 'other') {
    return { key: 'category', points: 20, max: 40, detail: 'possibly the same kind of item' };
  }
  return { key: 'category', points: 0, max: 40, detail: 'different category', rejected: true };
}

// Colour: the share of the lost item's colours that the found item also has, times 15.
export function scoreColours(lostColors = [], foundColors = []) {
  if (lostColors.length === 0 || foundColors.length === 0) {
    return { key: 'colour', points: 0, max: 15, detail: 'no colour to compare' };
  }
  const shared = lostColors.filter((color) => foundColors.includes(color));
  const points = Math.round((15 * shared.length) / lostColors.length);
  const detail = shared.length > 0 ? `same colour (${shared.join(', ')})` : 'different colours';
  return { key: 'colour', points, max: 15, detail };
}

// Text: Jaccard similarity of the words in title, description and brand, times 20.
export function scoreText(lost, found) {
  const lostWords = tokenise(itemText(lost));
  const foundWords = tokenise(itemText(found));
  const points = Math.round(20 * jaccard(lostWords, foundWords));
  const shared = sharedWords(lostWords, foundWords).slice(0, 3);
  const detail = shared.length > 0 ? `similar words (${shared.join(', ')})` : 'no words in common';
  return { key: 'text', points, max: 20, detail };
}

// Place: same area 15, same floor 10, same building 6, otherwise 0.
export function scorePlace(lostSeen, foundAt) {
  if (!lostSeen || !foundAt) {
    return { key: 'place', points: 0, max: 15, detail: 'no place to compare' };
  }
  const sameBuilding = lostSeen.buildingId === foundAt.buildingId;
  const sameFloor = sameBuilding && lostSeen.floorId === foundAt.floorId;
  if (sameFloor && lostSeen.areaId && lostSeen.areaId === foundAt.areaId) {
    return { key: 'place', points: 15, max: 15, detail: 'found in the same spot' };
  }
  if (sameFloor) return { key: 'place', points: 10, max: 15, detail: 'same floor' };
  if (sameBuilding) return { key: 'place', points: 6, max: 15, detail: 'same building' };
  return { key: 'place', points: 0, max: 15, detail: 'a different building' };
}

// "found 5 hours after you lost it" or "found 2 days after you lost it".
function afterText(hours) {
  if (hours === 0) return 'found while you were missing it';
  if (hours < 48) return `found ${hours} ${hours === 1 ? 'hour' : 'hours'} after you lost it`;
  return `found ${Math.round(hours / 24)} days after you lost it`;
}

// Time: full 10 points within 24 hours after the lost window, falling to 0 at 72 hours.
// An item found before the person lost theirs cannot be it, so the pair is rejected.
export function scoreTime(lostFrom, lostTo, foundAt) {
  if (!lostFrom || !foundAt) {
    return { key: 'time', points: 0, max: 10, detail: 'no time to compare' };
  }
  const found = new Date(foundAt).getTime();
  if (found < new Date(lostFrom).getTime()) {
    return { key: 'time', points: 0, max: 10, detail: 'found before you lost it', rejected: true };
  }
  const windowEnd = new Date(lostTo || lostFrom).getTime();
  const hours = Math.max(0, Math.round((found - windowEnd) / HOUR_MS));
  let points = 0;
  if (hours <= 24) points = 10;
  else if (hours < 72) points = Math.round((10 * (72 - hours)) / 48);
  return { key: 'time', points, max: 10, detail: afterText(hours) };
}

// The full score of one lost report against one found item.
export function score(lost, found) {
  const breakdown = [
    scoreCategory(lost.category, found.category),
    scorePlace(lost.lastSeen, found.location),
    scoreColours(lost.colors, found.colors),
    scoreText(lost, found),
    scoreTime(lost.lostFrom, lost.lostTo, found.foundAt),
  ];
  const total = breakdown.reduce((sum, factor) => sum + factor.points, 0);
  const rejected = breakdown.some((factor) => factor.rejected);
  // Keep only the four fields we save; "rejected" was just for the check above.
  const saved = breakdown.map((factor) => ({
    key: factor.key,
    points: factor.points,
    max: factor.max,
    detail: factor.detail,
  }));
  return { total, rejected, breakdown: saved };
}

// Keep this pair as a match?
export function isGoodMatch(result) {
  return !result.rejected && result.total >= MIN_TOTAL;
}
