// /verify - the claims I made, newest first, plus items I found and kept that are
// waiting for me to confirm the handover. Each ticket opens the claim page.
import { useNavigate } from 'react-router-dom';
import { EmptyState, PageHeader, PropertyTag, Spinner } from '../../../shared/ui/index.js';
import { getMyClaims } from '../api.js';
import { useLoad } from '../hooks/useLoad.js';
import { ticketOf } from '../format.js';

// A list of claim tickets that open the claim page when tapped.
function ClaimTickets({ claims, navigate }) {
  return (
    <ul className="ticket-list">
      {claims.map((claim) => (
        <li key={claim.id}>
          <PropertyTag
            item={{ ...ticketOf(claim.item, claim.status), serial: claim.serial }}
            onClick={() => navigate(`/verify/claim/${claim.id}`)}
          />
        </li>
      ))}
    </ul>
  );
}

export function MyClaimsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useLoad(getMyClaims);

  if (loading) return <Spinner />;
  if (error) return <p className="field-error page">{error}</p>;

  return (
    <section className="page verify-page">
      <PageHeader title="My claims" subtitle={`${data.claims.length} claims`} />
      {data.toConfirm.length > 0 ? (
        <>
          <h2>Handovers to confirm</h2>
          <ClaimTickets claims={data.toConfirm} navigate={navigate} />
        </>
      ) : null}
      {data.claims.length === 0 ? (
        <EmptyState title="No claims yet. When a found item looks like yours, open it and choose Claim." />
      ) : (
        <ClaimTickets claims={data.claims} navigate={navigate} />
      )}
    </section>
  );
}
