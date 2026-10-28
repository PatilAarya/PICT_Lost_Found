// How similar two short texts are, using token Jaccard similarity:
// split both texts into words, drop tiny filler words, then
// similarity = (words in both) / (words in either). 1 means identical word sets, 0 means none shared.
// Used by matching.js for the "text" part of a match score.

// Common words that say nothing about the item itself.
const FILLER_WORDS = new Set([
  'a',
  'an',
  'and',
  'the',
  'of',
  'in',
  'on',
  'at',
  'to',
  'with',
  'my',
  'it',
  'is',
  'near',
  'for',
  'from',
  'some',
  'one',
  'has',
  'was',
  'left',
  'found',
  'lost',
]);

// "Blue STEEL bottle, with a dent!" -> ['blue', 'steel', 'bottle', 'dent'] (no repeats).
export function tokenise(text) {
  const words = String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !FILLER_WORDS.has(word));
  return [...new Set(words)];
}

// The words two token lists have in common.
export function sharedWords(firstWords, secondWords) {
  const second = new Set(secondWords);
  return firstWords.filter((word) => second.has(word));
}

// Jaccard similarity between two token lists, from 0 to 1.
export function jaccard(firstWords, secondWords) {
  const shared = sharedWords(firstWords, secondWords).length;
  const either = new Set([...firstWords, ...secondWords]).size;
  return either === 0 ? 0 : shared / either;
}

// The text we compare for an item: its title, description and brand together.
export function itemText(item) {
  return `${item.title || ''} ${item.description || ''} ${item.brand || ''}`;
}
