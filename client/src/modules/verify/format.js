// Formats dates, countdowns, places and tickets for the verify screens.
import { placeName } from '../../shared/location-picker/places.js';

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function formatDateTime(value) {
  return value ? dateTime.format(new Date(value)) : '';
}

export function formatCountdown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours} h ${String(minutes).padStart(2, '0')} min`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function placeLabel(location) {
  return placeName(location);
}

export function ticketOf(item, status) {
  return {
    kind: 'found',
    serial: item.serial,
    category: item.category,
    title: item.title,
    status: status || item.status,
    locationLabel: placeLabel(item.location),
    timeLabel: formatDateTime(item.foundAt),
    imageUrl: item.images && item.images[0] ? item.images[0].publicUrl : '',
  };
}

export function percent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

const ACTION_WORDS = {
  POSTED: 'Posted by the finder',
  DROPPED_AT_DESK: 'Dropped at the desk',
  RECEIVED_BY_HANDLER: 'Received by the desk',
  STORED: 'Stored on the shelf',
  CLAIM_SUBMITTED: 'Claim sent',
  VERIFICATION_PASSED: 'Owner check passed',
  VERIFICATION_FAILED: 'Owner check failed',
  LOCKED_OUT: 'Claimant locked out',
  APPROVED: 'Claim approved',
  REJECTED: 'Claim rejected',
  RELEASED: 'Handed to the owner',
  TRANSFERRED_TO_ADMIN: 'Moved to the admin office',
  EXPIRED: 'Expired',
  DONATED: 'Donated',
};

export function actionWord(action) {
  return ACTION_WORDS[action] || String(action).replaceAll('_', ' ').toLowerCase();
}
