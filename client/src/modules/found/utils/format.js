// Small text helpers for the found screens: a readable place and a readable date.
// Intl.DateTimeFormat is the browser's own date formatter, so no library is needed.
// Used by utils/ticket.js and the post flow when building tickets and summaries.
import { placeName } from '../../../shared/location-picker/places.js';

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

// "27 Oct 2026, 2:15 pm", or '' for no date.
export function formatDateTime(value) {
  return value ? dateTime.format(new Date(value)) : '';
}

// "Lab building, Ground floor, Canteen" from a Location object, or '' when there is none.
// The names come from locations.json through shared/location-picker/places.js.
export function placeLabel(location) {
  return placeName(location);
}

// How many secret questions have a real (not blank) answer.
export function answeredCount(hiddenDetails) {
  return hiddenDetails.filter((detail) => detail.answer.trim() !== '').length;
}
