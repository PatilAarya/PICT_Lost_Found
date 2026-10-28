// Rubber stamp that shows a status in words: Stamp { status } (DESIGN.md section 7).
// Covers every value of FOUND_STATUS, LOST_STATUS and CLAIM_STATUS, plus the flag
// statuses used by the verify module. Red ink = lost or needs attention, steel = found
// or in progress, dark ink = finished. Styles and the drop-in motion are in stamp.css.
import { useRef } from 'react';
import './stamp.css';

// The words printed on the stamp for each status value.
const STATUS_WORDS = {
  // Found items
  posted: 'Posted',
  in_custody: 'In custody',
  claim_pending: 'Claim pending',
  verified: 'Verified',
  released: 'Released',
  transferred_admin: 'Moved to admin office',
  expired: 'Expired',
  donated: 'Donated',
  // Lost reports
  open: 'Open',
  matched: 'Matched',
  claim_in_progress: 'Claim pending',
  recovered: 'Recovered',
  closed: 'Closed',
  // Claims
  answering: 'Answering',
  locked: 'Locked',
  awaiting_handler: 'With the desk',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  // Account flags
  dismissed: 'Dismissed',
  warned: 'Warned',
  suspended: 'Suspended',
};

// Which ink a status uses. Anything not listed is "in progress" (steel).
const RED_INK = ['open', 'matched', 'rejected', 'expired', 'locked', 'warned', 'suspended'];
const DARK_INK = [
  'verified',
  'released',
  'recovered',
  'approved',
  'closed',
  'donated',
  'transferred_admin',
  'cancelled',
  'dismissed',
];

// Return 'lost' (red), 'done' (dark) or 'found' (steel) for a status value.
export function inkFor(status) {
  if (RED_INK.includes(status)) {
    return 'lost';
  }
  if (DARK_INK.includes(status)) {
    return 'done';
  }
  return 'found';
}

// The printed words for a status, or the raw value made readable if it is new.
export function stampWord(status) {
  return STATUS_WORDS[status] || String(status).replaceAll('_', ' ');
}

export function Stamp({ status }) {
  // Remember the first status this stamp showed. Only a later, different status
  // gets the drop-in motion, so a page full of tickets does not all animate on load.
  const firstStatus = useRef(status);
  const changed = status !== firstStatus.current;
  return (
    <span
      // A new key makes React build a fresh element, which restarts the CSS animation.
      key={status}
      className={`stamp stamp-${inkFor(status)} ${changed ? 'stamp-drop' : ''}`}
    >
      {stampWord(status)}
    </span>
  );
}
