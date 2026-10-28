// Desk tab 1: claims waiting for a decision. Each row shows the item, who is claiming
// it and how well their answers matched, with a Review button. Review opens
// ClaimReview in a Sheet (a centred window on a laptop, a bottom sheet on a phone).
import { useState } from 'react';
import { Button, EmptyState, PropertyTag, Sheet, useToast } from '../../../../shared/ui/index.js';
import { getDeskQueue } from '../../api.js';
import { useLoad } from '../../hooks/useLoad.js';
import { formatDateTime, percent, ticketOf } from '../../format.js';
import { ClaimReview } from './ClaimReview.jsx';
import { ScoreMeter } from './ScoreMeter.jsx';

// One waiting claim: compact ticket, claimant, score and the Review button.
function QueueRow({ claim, onOpen }) {
  return (
    <li className="queue-row">
      <PropertyTag item={{ ...ticketOf(claim.item), serial: claim.serial }} compact />
      <div className="queue-who">
        <strong>{claim.claimant?.name || 'Unknown'}</strong>
        <span className="muted">Claimed {formatDateTime(claim.createdAt)}</span>
      </div>
      <ScoreMeter score={claim.score} />
      <Button onClick={() => onOpen(claim)} aria-label={`Review claim ${claim.serial}`}>
        Review
      </Button>
    </li>
  );
}

export function QueueTab() {
  const toast = useToast();
  const { data: claims, loading, error, reload } = useLoad(getDeskQueue);
  const [openClaim, setOpenClaim] = useState(null);

  // Close the window, say what happened, refresh the queue.
  function handleDecided(decision) {
    setOpenClaim(null);
    toast(
      decision === 'approve'
        ? 'Approved. The owner can now see their code.'
        : 'Rejected. The claimant was told.'
    );
    reload();
  }

  if (loading && !claims) return <p className="muted">Loading the queue</p>;
  if (error) return <p className="field-error">{error}</p>;
  if (claims.length === 0) {
    return <EmptyState illustration="no-matches" title="No claims waiting. Nice and quiet." />;
  }

  return (
    <>
      <ul className="queue-list">
        {claims.map((claim) => (
          <QueueRow key={claim.id} claim={claim} onOpen={setOpenClaim} />
        ))}
      </ul>
      <Sheet
        open={Boolean(openClaim)}
        onClose={() => setOpenClaim(null)}
        title={openClaim ? `Claim ${openClaim.serial} · ${percent(openClaim.score)} match` : ''}
      >
        {openClaim ? <ClaimReview claim={openClaim} onDecided={handleDecided} /> : null}
      </Sheet>
    </>
  );
}
