// Small formatting helpers shared by the verify screens: dates, countdowns,
// places, and turning a public item into the props PropertyTag expects.
// Intl.DateTimeFormat is the browser's own date formatter, so no library is needed.

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

// "27 Oct 2026, 2:15 pm", or '' for no date.
export function formatDateTime(value) {
  return value ? dateTime.format(new Date(value)) : '';
}

// 125000 ms -> "2:05" (minutes:seconds), or "1 h 05 min" when over an hour.
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

// "main, floor 1, entrance" from a Location object.
export function placeLabel(location) {
  if (!location) {
    return '';
  }
  const parts = [location.buildingId, `floor ${location.floorId}`, location.areaId];
  return parts.filter(Boolean).join(', ').replaceAll('-', ' ');
}

// The props PropertyTag needs, from a public item (and an optional status to stamp).
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

// 0.86 -> "86%".
export function percent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

// Plain words for each custody action (CUSTODY_ACTIONS in shared/constants.js).
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

// "DROPPED_AT_DESK" -> "Dropped at the desk".
export function actionWord(action) {
  return ACTION_WORDS[action] || String(action).replaceAll('_', ' ').toLowerCase();
}
