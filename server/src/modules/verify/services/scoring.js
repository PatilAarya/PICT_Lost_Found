// Scores a claimant's answers against the finder's.
import { distance } from 'fastest-levenshtein';

export const MIN_SIMILARITY = 0.8;
export const PASS_AVERAGE = 0.7;

export function normalise(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function similarity(first, second) {
  const longest = Math.max(first.length, second.length);
  if (longest === 0) {
    return 1;
  }
  return 1 - distance(first, second) / longest;
}

export function scoreAnswer(given, expected) {
  const cleanGiven = normalise(given);
  const cleanExpected = normalise(expected);
  if (cleanGiven.length === 0) {
    return 0;
  }
  if (cleanGiven === cleanExpected) {
    return 1;
  }
  const ratio = similarity(cleanGiven, cleanExpected);
  return ratio >= MIN_SIMILARITY ? Number(ratio.toFixed(2)) : 0;
}

export function scoreAnswers(hiddenDetails, answers) {
  const textByKey = new Map((answers || []).map((answer) => [answer.promptKey, answer.text]));
  const scores = hiddenDetails.map((detail) => ({
    promptKey: detail.promptKey,
    score: scoreAnswer(textByKey.get(detail.promptKey), detail.answer),
  }));
  const total = scores.reduce((sum, item) => sum + item.score, 0);
  const average = scores.length ? Number((total / scores.length).toFixed(2)) : 0;
  const passed = scores.length > 0 && average >= PASS_AVERAGE && scores.every((s) => s.score > 0);
  return { scores, average, passed };
}
