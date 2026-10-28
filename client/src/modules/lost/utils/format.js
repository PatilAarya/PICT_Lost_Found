// Formats places, dates and tickets for the lost screens.
import { placeName } from '../../../shared/location-picker/places.js';

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function formatDateTime(value) {
  return value ? dateTime.format(new Date(value)) : '';
}

export function placeLabel(location) {
  return placeName(location);
}

export function toLocalInput(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function lostWindowLabel(report) {
  if (!report.lostFrom) return '';
  return `Lost ${formatDateTime(report.lostFrom)}`;
}

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
