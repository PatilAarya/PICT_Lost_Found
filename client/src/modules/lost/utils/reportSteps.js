// The five steps of "report lost item": the name in the progress bar, the card title and
// help line, and a tip for the side panel. Also the empty form, how a saved item fills it,
// and canContinue(), which says whether Next may be pressed. Pure data and functions.
import { CATEGORIES } from '../../../shared/constants.js';
import { toLocalInput } from './format.js';

// `category` on each option makes ChipSelect draw a tile with the pictogram.
export const CATEGORY_TILES = CATEGORIES.map((category) => ({
  value: category,
  label: category.replace('_', ' '),
  category,
}));

export const STEPS = [
  {
    name: 'Category',
    title: 'What did you lose?',
    hint: 'Pick the closest match, or tap one of your saved items.',
    tip: 'Only items in the same category are compared, so pick carefully.',
  },
  {
    name: 'Details',
    title: 'Describe it',
    hint: 'A short name, its colours and anything that stands out.',
    tip: 'Words like the brand or a sticker help the match engine.',
  },
  {
    name: 'Where',
    title: 'Where did you last have it?',
    hint: 'Choose the building and floor, and the room if you know it.',
    tip: 'Items found in the same spot score highest.',
  },
  {
    name: 'When',
    title: 'When did you lose it?',
    hint: 'From when you last had it, to when you noticed it was gone.',
    tip: 'Items found within a day of this window score highest.',
  },
  {
    name: 'Review',
    title: 'Check and report',
    hint: 'We will start looking as soon as you send this.',
    tip: 'You get an alert as soon as a matching item is handed in.',
  },
];

// A new, empty report: lost "from 3 hours ago to now" as a sensible start.
export function emptyReport() {
  const now = new Date();
  return {
    category: '',
    title: '',
    description: '',
    colors: [],
    brand: '',
    lastSeen: null,
    lostFrom: toLocalInput(new Date(now.getTime() - 3 * 60 * 60 * 1000)),
    lostTo: toLocalInput(now),
    savedItemId: '',
    saveForLater: false,
  };
}

// Fill a report from a saved item (the person described it once before).
export function reportFromSaved(saved) {
  const details = [saved.description, saved.stickers].filter(Boolean).join('. ');
  return {
    ...emptyReport(),
    category: saved.category,
    title: saved.label.replace(/^my\s+/i, ''),
    description: details,
    colors: saved.colors || [],
    brand: saved.brand || '',
    savedItemId: saved._id,
  };
}

// May the person move on from this step yet?
export function canContinue(stepIndex, form) {
  if (stepIndex === 0) return Boolean(form.category);
  if (stepIndex === 1) return form.title.trim() !== '';
  if (stepIndex === 2) return Boolean(form.lastSeen?.buildingId && form.lastSeen?.floorId);
  if (stepIndex === 3) return Boolean(form.lostFrom && form.lostTo && form.lostTo >= form.lostFrom);
  return true;
}
