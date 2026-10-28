// Turns found-item data into the plain shape PropertyTag expects, and counts items
// by status for the number cards on the Found page. Pure functions, easy to test.
import { formatDateTime, placeLabel } from './format.js';

// A saved FoundItem from the server, as a ticket.
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

// The form while posting, as a preview ticket (no serial yet).
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

// How many of my items are waiting at a desk and how many went back to their owner.
export function countByStage(items) {
  const atDesk = items.filter((item) =>
    ['posted', 'in_custody', 'claim_pending', 'verified'].includes(item.status)
  );
  const returned = items.filter((item) => item.status === 'released');
  return { total: items.length, atDesk: atDesk.length, returned: returned.length };
}
