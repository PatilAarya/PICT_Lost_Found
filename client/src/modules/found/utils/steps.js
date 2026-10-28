// The steps of posting a found item and when each can continue.
import { answeredCount } from './format.js';

export const MIN_ANSWERS = 2;

export const STEPS = [
  {
    name: 'Category',
    title: 'What did you find?',
    hint: 'Pick the closest match. Choose Other if nothing fits.',
    tip: 'The category decides which secret questions the owner gets.',
  },
  {
    name: 'Photos',
    title: 'Add photos',
    hint: 'Up to 4 photos: front, back, a close-up and any mark.',
    tip: 'Clear photos help the owner recognise their item at a glance.',
  },
  {
    name: 'Blur',
    title: 'Hide anything private',
    hint: 'Drag over screens, ID numbers or names. Everyone else sees the blurred copy.',
    tip: 'Only the security desk can ever see the clear original.',
  },
  {
    name: 'Details',
    title: 'Describe the item',
    hint: 'A short title like "Blue steel bottle" is enough.',
    tip: 'We guess the colours from your photo; change them if they are wrong.',
  },
  {
    name: 'Secret questions',
    title: 'Answer two secret questions',
    hint: 'Only the real owner should know these answers.',
    tip: 'The owner must answer these too before the desk hands the item over.',
  },
  {
    name: 'Place and time',
    title: 'Where and when did you find it?',
    hint: 'Choose the building and floor, then the time.',
    tip: 'The place helps us match it with lost reports nearby.',
  },
  {
    name: 'Drop-off',
    title: 'Where will the item be?',
    hint: 'We suggest the nearest desk. You can also keep it and meet the owner.',
    tip: 'Desk items move to the admin office after 24 hours.',
  },
  {
    name: 'Review',
    title: 'Check and post',
    hint: 'This is what the owner will see. You cannot change it after posting.',
    tip: 'After posting, take the item to the desk you chose.',
  },
];

export function canContinue(stepIndex, form) {
  if (stepIndex === 0) return Boolean(form.category);
  if (stepIndex === 1) return form.photos.length > 0;
  if (stepIndex === 3) return form.title.trim() !== '';
  if (stepIndex === 4) return answeredCount(form.hiddenDetails) >= MIN_ANSWERS;
  if (stepIndex === 5) return Boolean(form.location?.buildingId && form.location?.floorId);
  if (stepIndex === 6) return form.custody.type === 'finder' || Boolean(form.custody.deskId);
  return true;
}
