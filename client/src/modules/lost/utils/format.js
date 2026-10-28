// Small helpers for the lost screens: readable places and dates, the value a
// datetime-local input needs, and a lost report shaped for PropertyTag.
// Intl.DateTimeFormat is the browser's own date formatter, so no library is needed.
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

// A Date as "2026-10-27T13:15", the format an <input type="datetime-local"> expects.
// getTimezoneOffset is subtracted so the box shows local time, not UTC.
export function toLocalInput(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

// "Lost 27 Oct 2026, 10:00 am" (the start of the lost window) for a ticket.
export function lostWindowLabel(report) {
  if (!report.lostFrom) return '';
  return `Lost ${formatDateTime(report.lostFrom)}`;
}

// A lost report as the item PropertyTag expects.
export function ticketFromReport(report) {
  return {
    kind: 'lost',
    serial: report.serial,
    category: report.category,
    title: report.title,
    status: report.status,
    locationLabel: placeLabel(report.lastSeen),
    timeLabel: lostWindowLabel(report),
    imageUrl: report.imageUrl || null,
  };
}

// A matched found item (public view from the server) as a found ticket.
export function ticketFromFoundItem(item) {
  return {
    kind: 'found',
    serial: item.serial,
    category: item.category,
    title: item.title,
    status: item.status,
    locationLabel: placeLabel(item.location),
    timeLabel: `Found ${formatDateTime(item.foundAt)}`,
    imageUrl: item.imageUrl || null,
  };
}
