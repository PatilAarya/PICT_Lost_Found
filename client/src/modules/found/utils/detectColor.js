// Guesses the one or two most likely colours of a found item from its
// photo, entirely in the browser, using plain Canvas pixel maths.
// This project does not use an image recognition library on purpose
// (see docs/explain/found.md): true category detection needs a trained
// model, which this course is not about. Colour, however, can be guessed
// honestly with simple maths: shrink the photo, count which rough colour
// each pixel is closest to, and report the most common ones. This is
// always shown to the finder as a guess to confirm or change, never
// trusted as fact.
import { COLORS } from '../../../shared/constants.js';

// One representative RGB value for every named colour except
// "multicolor", which is decided separately based on how varied the
// photo's colours are, not matched to a single reference point.
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

// Finds the named colour whose reference RGB is closest to a given
// pixel, using plain Euclidean distance in RGB space. This is a rough
// guess, not perceptual colour matching, but is easy to explain and
// good enough to suggest a starting point for the finder.
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

// Draws the photo onto a small hidden canvas and reads its pixels back.
// Shrinking to 40x40 first keeps this fast: 1600 pixels is plenty for a
// rough colour guess and far cheaper than scanning a full-size photo.
function readPixels(imageBitmap) {
  const size = 40;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  context.drawImage(imageBitmap, 0, 0, size, size);
  return context.getImageData(0, 0, size, size).data;
}

// The main export: looks at a photo blob and returns a best guess in the
// same shape as FoundItem.aiSuggestion on the server: { colors, confidence }.
export async function detectColors(photoBlob) {
  const imageBitmap = await createImageBitmap(photoBlob);
  const pixels = readPixels(imageBitmap);

  // Count how many sampled pixels land closest to each named colour.
  const counts = {};
  let totalCounted = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha < 200) continue; // skip transparent or faded edge pixels

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

  // If no single colour clearly dominates the photo, call it multicolor
  // instead of guessing wrong. 0.4 is a simple, explainable cutoff: the
  // top colour must cover less than 40% of the sampled pixels, with at
  // least three different colours present.
  if (topShare < 0.4 && ranked.length >= 3) {
    return { colors: ['multicolor'], confidence: Math.round((1 - topShare) * 100) / 100 };
  }

  // Otherwise suggest the top one or two colours actually seen, filtered
  // through the fixed COLORS list as a safety check.
  const suggestions = ranked
    .slice(0, 2)
    .map(([name]) => name)
    .filter((name) => COLORS.includes(name));

  return { colors: suggestions, confidence: Math.round(topShare * 100) / 100 };
}