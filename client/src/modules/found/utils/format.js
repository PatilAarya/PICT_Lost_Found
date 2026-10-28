// Formats places and dates for the found screens.
import { placeName } from '../../../shared/location-picker/places.js';

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function formatDateTime(value) {
  return value ? dateTime.format(new Date(value)) : '';
}

export function placeLabel(location) {
  return placeName(location);
}

export function answeredCount(hiddenDetails) {
  return hiddenDetails.filter((detail) => detail.answer.trim() !== '').length;
}
