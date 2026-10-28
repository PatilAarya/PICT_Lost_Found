// Rubber stamp that shows a status in words.
import { useRef } from 'react';
import './stamp.css';

const STATUS_WORDS = {
  posted: 'Posted',
  in_custody: 'In custody',
  claim_pending: 'Claim pending',
  verified: 'Verified',
  released: 'Released',
  transferred_admin: 'Moved to admin office',
  expired: 'Expired',
  donated: 'Donated',
  open: 'Open',
  matched: 'Matched',
  claim_in_progress: 'Claim pending',
  recovered: 'Recovered',
  closed: 'Closed',
  answering: 'Answering',
  locked: 'Locked',
  awaiting_handler: 'With the desk',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  dismissed: 'Dismissed',
  warned: 'Warned',
  suspended: 'Suspended',
};

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

export function inkFor(status) {
  if (RED_INK.includes(status)) {
    return 'lost';
  }
  if (DARK_INK.includes(status)) {
    return 'done';
  }
  return 'found';
}

export function stampWord(status) {
  return STATUS_WORDS[status] || String(status).replaceAll('_', ' ');
}

export function Stamp({ status }) {
  const firstStatus = useRef(status);
  const changed = status !== firstStatus.current;
  return (
    <span key={status} className={`stamp stamp-${inkFor(status)} ${changed ? 'stamp-drop' : ''}`}>
      {stampWord(status)}
    </span>
  );
}
