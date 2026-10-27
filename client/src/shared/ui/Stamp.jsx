// STUB rubber stamp that shows a status in words: Stamp { status }.
// The words and ink colours come from DESIGN.md section 7. Member 1 adds the
// double border, rotation and the 250ms drop-in animation.

// The words printed on the stamp for each status value.
const STATUS_WORDS = {
  posted: 'Posted',
  in_custody: 'In custody',
  matched: 'Matched',
  claim_pending: 'Claim pending',
  claim_in_progress: 'Claim pending',
  verified: 'Verified',
  released: 'Released',
  transferred_admin: 'Moved to admin office',
  expired: 'Expired',
  donated: 'Donated',
  recovered: 'Recovered',
  closed: 'Closed',
  open: 'Open',
  rejected: 'Rejected',
  approved: 'Approved',
};

// Which ink colour a status uses: berry (red), steel (blue) or ink (dark).
function inkFor(status) {
  if (['matched', 'rejected', 'expired', 'open'].includes(status)) {
    return 'berry';
  }
  if (['verified', 'released', 'recovered', 'approved'].includes(status)) {
    return 'ink';
  }
  return 'steel';
}

export function Stamp({ status }) {
  const word = STATUS_WORDS[status] || String(status).replaceAll('_', ' ');
  return <span className={`stamp stamp-${inkFor(status)}`}>{word}</span>;
}
