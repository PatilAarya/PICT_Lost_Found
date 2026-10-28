// Measures how similar two short texts are.
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

export function tokenise(text) {
  const words = String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !FILLER_WORDS.has(word));
  return [...new Set(words)];
}

export function sharedWords(firstWords, secondWords) {
  const second = new Set(secondWords);
  return firstWords.filter((word) => second.has(word));
}

export function jaccard(firstWords, secondWords) {
  const shared = sharedWords(firstWords, secondWords).length;
  const either = new Set([...firstWords, ...secondWords]).size;
  return either === 0 ? 0 : shared / either;
}

export function itemText(item) {
  return `${item.title || ''} ${item.description || ''} ${item.brand || ''}`;
}
