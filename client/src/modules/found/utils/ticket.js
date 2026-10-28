// Turns found items into ticket data and counts them by status.
import { formatDateTime, placeLabel } from './format.js';

export function ticketFromItem(doc) {
  return {
    kind: 'found',
    serial: doc.serial,
    category: doc.category,
    title: doc.title,
    status: doc.status,
    locationLabel: placeLabel(doc.location),
    timeLabel: formatDateTime(doc.foundAt),
    imageUrl: doc.images?.[0]?.publicUrl || null,
  };
}

export function ticketFromForm(form, imageUrl) {
  return {
    kind: 'found',
    serial: '',
    category: form.category || 'other',
    title: form.title || 'Your found item',
    status: 'posted',
    locationLabel: placeLabel(form.location) || 'Place not chosen yet',
    timeLabel: formatDateTime(form.foundAt),
    imageUrl,
  };
}

export function countByStage(items) {
  const atDesk = items.filter((item) =>
    ['posted', 'in_custody', 'claim_pending', 'verified'].includes(item.status)
  );
  const returned = items.filter((item) => item.status === 'released');
  return { total: items.length, atDesk: atDesk.length, returned: returned.length };
}
