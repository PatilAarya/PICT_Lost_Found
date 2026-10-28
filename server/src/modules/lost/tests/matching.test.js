// Tests for the pure match engine and the "why this match" sentence: every factor's
// points, the category rule, the 45-point threshold, and the wording of the sentence.
// No database needed. Run with `npm test -w server`.
import { describe, expect, it } from 'vitest';
import {
  MIN_TOTAL,
  isGoodMatch,
  score,
  scoreCategory,
  scoreColours,
  scorePlace,
  scoreTime,
} from '../services/matching.js';
import { jaccard, tokenise } from '../services/textSimilarity.js';
import { whyThisMatch } from '../services/explain.js';

const HOUR = 60 * 60 * 1000;
const lostTo = new Date('2026-10-27T12:00:00Z');
const lostFrom = new Date(lostTo.getTime() - 3 * HOUR);
const place = { buildingId: 'main', floorId: '1', areaId: 'staff-room' };

const lost = {
  category: 'bottle',
  title: 'Green steel water bottle',
  colors: ['green'],
  lastSeen: place,
  lostFrom,
  lostTo,
};
const found = {
  category: 'bottle',
  title: 'Steel water bottle',
  colors: ['green'],
  location: place,
  foundAt: new Date(lostTo.getTime() + 2 * HOUR),
};

describe('factors', () => {
  it('category: same 40, "other" 20, different rejects', () => {
    expect(scoreCategory('bottle', 'bottle').points).toBe(40);
    expect(scoreCategory('bottle', 'other').points).toBe(20);
    expect(scoreCategory('bottle', 'phone').rejected).toBe(true);
  });

  it('colour: share of the lost colours that match, out of 15', () => {
    expect(scoreColours(['red', 'black'], ['black']).points).toBe(8);
    expect(scoreColours(['red'], ['blue']).points).toBe(0);
    expect(scoreColours([], ['blue']).detail).toBe('no colour to compare');
  });

  it('place: area 15, floor 10, building 6, else 0', () => {
    expect(scorePlace(place, place).points).toBe(15);
    expect(scorePlace(place, { ...place, areaId: 'library' }).points).toBe(10);
    expect(scorePlace(place, { ...place, floorId: '2' }).points).toBe(6);
    expect(scorePlace(place, { buildingId: 'lab', floorId: '1' }).points).toBe(0);
  });

  it('time: 10 within a day, falling to 0 at 72 hours, 0 if found before', () => {
    const after = (hours) => new Date(lostTo.getTime() + hours * HOUR);
    expect(scoreTime(lostFrom, lostTo, after(5)).points).toBe(10);
    expect(scoreTime(lostFrom, lostTo, after(48)).points).toBe(5);
    expect(scoreTime(lostFrom, lostTo, after(80)).points).toBe(0);
    const before = scoreTime(lostFrom, lostTo, new Date(lostFrom.getTime() - HOUR));
    expect(before.points).toBe(0);
    expect(before.rejected).toBe(true);
  });

  it('text: Jaccard over words, ignoring filler words', () => {
    expect(tokenise('The BLUE bottle, with a dent!')).toEqual(['blue', 'bottle', 'dent']);
    expect(jaccard(['steel', 'bottle'], ['steel', 'bottle', 'green'])).toBeCloseTo(2 / 3);
  });
});

describe('score', () => {
  it('adds the five factors and keeps a strong pair', () => {
    const result = score(lost, found);
    expect(result.breakdown.map((factor) => factor.key)).toEqual([
      'category',
      'place',
      'colour',
      'text',
      'time',
    ]);
    expect(result.total).toBe(40 + 15 + 15 + 15 + 10);
    expect(isGoodMatch(result)).toBe(true);
  });

  it('drops pairs from different categories and pairs under the threshold', () => {
    expect(isGoodMatch(score(lost, { ...found, category: 'phone' }))).toBe(false);
    const weak = score(lost, { category: 'other', title: 'umbrella', foundAt: found.foundAt });
    expect(weak.total).toBeLessThan(MIN_TOTAL);
    expect(isGoodMatch(weak)).toBe(false);
  });
});

describe('whyThisMatch', () => {
  it('names only the factors that earned points, strongest first', () => {
    const sentence = whyThisMatch(score(lost, found).breakdown);
    expect(sentence).toBe(
      'Same category, found in the same spot, same colour (green), similar words (steel, water, bottle), found 2 hours after you lost it.'
    );
  });

  it('has a fallback when nothing matched', () => {
    expect(whyThisMatch([{ key: 'time', points: 0, max: 10, detail: 'x' }])).toBe(
      'Only a few things in common.'
    );
  });
});
