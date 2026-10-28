// Guesses an item's main colours from its photo.
import { COLORS } from '../../../shared/constants.js';

const REFERENCE_RGB = {
  black: [20, 20, 20],
  white: [245, 245, 245],
  grey: [130, 130, 130],
  silver: [192, 192, 192],
  red: [200, 30, 30],
  maroon: [115, 25, 35],
  orange: [230, 120, 20],
  yellow: [230, 200, 30],
  green: [40, 140, 70],
  teal: [30, 140, 140],
  blue: [40, 90, 200],
  navy: [20, 40, 90],
  purple: [110, 50, 150],
  pink: [230, 150, 180],
  brown: [110, 70, 40],
  beige: [210, 190, 150],
  gold: [195, 160, 60],
};

function closestColorName(r, g, b) {
  let bestName = 'grey';
  let bestDistance = Infinity;
  for (const [name, [refR, refG, refB]] of Object.entries(REFERENCE_RGB)) {
    const distance = (r - refR) ** 2 + (g - refG) ** 2 + (b - refB) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestName = name;
    }
  }
  return bestName;
}

function readPixels(imageBitmap) {
  const size = 40;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  context.drawImage(imageBitmap, 0, 0, size, size);
  return context.getImageData(0, 0, size, size).data;
}

export async function detectColors(photoBlob) {
  const imageBitmap = await createImageBitmap(photoBlob);
  const pixels = readPixels(imageBitmap);

  const counts = {};
  let totalCounted = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha < 200) continue;

    const name = closestColorName(pixels[i], pixels[i + 1], pixels[i + 2]);
    counts[name] = (counts[name] || 0) + 1;
    totalCounted += 1;
  }

  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0 || totalCounted === 0) {
    return { colors: [], confidence: 0 };
  }

  const [, topCount] = ranked[0];
  const topShare = topCount / totalCounted;

  if (topShare < 0.4 && ranked.length >= 3) {
    return { colors: ['multicolor'], confidence: Math.round((1 - topShare) * 100) / 100 };
  }

  const suggestions = ranked
    .slice(0, 2)
    .map(([name]) => name)
    .filter((name) => COLORS.includes(name));

  return { colors: suggestions, confidence: Math.round(topShare * 100) / 100 };
}
