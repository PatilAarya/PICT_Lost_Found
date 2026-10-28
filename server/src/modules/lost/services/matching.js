// The match engine that scores a found item against a lost report.
import { itemText, jaccard, sharedWords, tokenise } from './textSimilarity.js';

export const MIN_TOTAL = 45;
const HOUR_MS = 60 * 60 * 1000;
const BEFORE_SLACK_HOURS = 24;

export function scoreCategory(lostCategory, foundCategory) {
  if (lostCategory === foundCategory) {
    return { key: 'category', points: 40, max: 40, detail: 'same category' };
  }
  if (lostCategory === 'other' || foundCategory === 'other') {
    return { key: 'category', points: 20, max: 40, detail: 'possibly the same kind of item' };
  }
  return { key: 'category', points: 0, max: 40, detail: 'different category', rejected: true };
}

export function scoreColours(lostColors = [], foundColors = []) {
  if (lostColors.length === 0 || foundColors.length === 0) {
    return { key: 'colour', points: 0, max: 15, detail: 'no colour to compare' };
  }
  const shared = lostColors.filter((color) => foundColors.includes(color));
  const points = Math.round((15 * shared.length) / lostColors.length);
  const detail = shared.length > 0 ? `same colour (${shared.join(', ')})` : 'different colours';
  return { key: 'colour', points, max: 15, detail };
}

export function scoreText(lost, found) {
  const lostWords = tokenise(itemText(lost));
  const foundWords = tokenise(itemText(found));
  const points = Math.round(20 * jaccard(lostWords, foundWords));
  const shared = sharedWords(lostWords, foundWords).slice(0, 3);
  const detail = shared.length > 0 ? `similar words (${shared.join(', ')})` : 'no words in common';
  return { key: 'text', points, max: 20, detail };
}

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

function afterText(hours) {
  if (hours === 0) return 'found within an hour of losing it';
  if (hours < 48) return `found ${hours} ${hours === 1 ? 'hour' : 'hours'} after you lost it`;
  return `found ${Math.round(hours / 24)} days after you lost it`;
}

export function scoreTime(lostFrom, lostTo, foundAt) {
  if (!lostFrom || !foundAt) {
    return { key: 'time', points: 0, max: 10, detail: 'no time to compare' };
  }
  const found = new Date(foundAt).getTime();
  const lostStart = new Date(lostFrom).getTime();
  if (found < lostStart - BEFORE_SLACK_HOURS * HOUR_MS) {
    return {
      key: 'time',
      points: 0,
      max: 10,
      detail: 'found a day before you lost it',
      rejected: true,
    };
  }
  if (found < lostStart) {
    return { key: 'time', points: 0, max: 10, detail: 'times overlap, check them' };
  }
  const windowEnd = new Date(lostTo || lostFrom).getTime();
  if (found <= windowEnd) {
    return { key: 'time', points: 10, max: 10, detail: 'found while you were missing it' };
  }
  const hours = Math.round((found - windowEnd) / HOUR_MS);
  let points = 0;
  if (hours <= 24) points = 10;
  else if (hours < 72) points = Math.round((10 * (72 - hours)) / 48);
  return { key: 'time', points, max: 10, detail: afterText(hours) };
}

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
  const saved = breakdown.map((factor) => ({
    key: factor.key,
    points: factor.points,
    max: factor.max,
    detail: factor.detail,
  }));
  return { total, rejected, breakdown: saved };
}

export function isGoodMatch(result) {
  return !result.rejected && result.total >= MIN_TOTAL;
}
