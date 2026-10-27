// Desk tab 1: claims waiting for a decision. Each row shows the item ticket, the
// claimant and the overall match score; tapping it opens ClaimReview in a Sheet.
import { useState } from 'react';
import { EmptyState, PropertyTag, Sheet, useToast } from '../../../../shared/ui/index.js';
import { getDeskQueue } from '../../api.js';
import { useLoad } from '../../hooks/useLoad.js';
import { percent, ticketOf } from '../../format.js';
import { ClaimReview } from './ClaimReview.jsx';

export function QueueTab() {
  const toast = useToast();
  const { data: claims, loading, error, reload } = useLoad(getDeskQueue);
  const [openClaim, setOpenClaim] = useState(null);

  // Close the sheet, say what happened, refresh the queue.
  function handleDecided(decision) {
    setOpenClaim(null);
    toast(
      decision === 'approve'
        ? 'Approved. The owner can now see their code.'
        : 'Rejected. The claimant was told.'
    );
    reload();
  }

  if (loading && !claims) return <p>Loading the queue</p>;
  if (error) return <p className="field-error">{error}</p>;
  if (claims.length === 0) return <EmptyState title="No claims waiting." />;

  return (
    <>
      <ul className="ticket-list">
        {claims.map((claim) => (
          <li key={claim.id} className="queue-row">
            <PropertyTag
              item={{
                ...ticketOf(claim.item),
                serial: claim.serial,
                timeLabel: claim.claimant.name,
              }}
              onClick={() => setOpenClaim(claim)}
            />
            <span className="queue-score tabular" aria-label={`Match ${percent(claim.score)}`}>
              {percent(claim.score)}
            </span>
          </li>
        ))}
      </ul>
      <Sheet
        open={Boolean(openClaim)}
        onClose={() => setOpenClaim(null)}
        title={openClaim ? `Claim ${openClaim.serial}` : ''}
      >
        {openClaim ? <ClaimReview claim={openClaim} onDecided={handleDecided} /> : null}
      </Sheet>
    </>
  );
}
