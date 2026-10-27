// /verify/claim/new?foundItemId=...&lostReportId=... - the first step of a claim.
// Shows the item's BLURRED public photo and ticket, then starts the claim on a
// button press and opens /verify/claim/:id where the questions are asked.
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../shared/api/client.js';
import { Button, EmptyState, PageHeader, PropertyTag, Spinner } from '../../../shared/ui/index.js';
import { getItemPreview, startClaim } from '../api.js';
import { useLoad } from '../hooks/useLoad.js';
import { ticketOf } from '../format.js';

export function NewClaimPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const foundItemId = params.get('foundItemId');
  const lostReportId = params.get('lostReportId') || undefined;
  const load = useCallback(
    () => (foundItemId ? getItemPreview(foundItemId) : Promise.resolve(null)),
    [foundItemId]
  );
  const { data: item, loading, error } = useLoad(load);
  const [startError, setStartError] = useState('');
  const [busy, setBusy] = useState(false);

  // Create (or reopen) the claim, then go to its page.
  async function handleStart() {
    setBusy(true);
    try {
      const claim = await startClaim(foundItemId, lostReportId);
      navigate(`/verify/claim/${claim.id}`);
    } catch (err) {
      setStartError(errorMessage(err));
      setBusy(false);
    }
  }

  if (!foundItemId) {
    return <EmptyState title="Open a found item and choose Claim to start." />;
  }
  if (loading) return <Spinner />;
  if (error) return <p className="field-error page">{error}</p>;

  return (
    <section className="page verify-page">
      <PageHeader
        title="Is this yours?"
        subtitle="Answer a few questions only the owner would know."
      />
      {item.images[0] ? (
        <img
          className="claim-photo"
          src={item.images[0].publicUrl}
          alt={`Blurred photo of ${item.title}`}
          loading="lazy"
        />
      ) : null}
      <PropertyTag item={ticketOf(item)} />
      <ol className="how-steps">
        <li>Answer the questions (3 tries)</li>
        <li>The desk checks your claim</li>
        <li>Collect it with your code and college ID</li>
      </ol>
      <Button size="lg" icon="arrow-right" loading={busy} onClick={handleStart}>
        Start owner check
      </Button>
      {startError ? <p className="field-error">{startError}</p> : null}
    </section>
  );
}
