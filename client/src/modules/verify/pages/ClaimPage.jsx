// One claim from the claimant's side.
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  PageHeader,
  PropertyTag,
  Spinner,
  Stamp,
  Timeline,
  useToast,
} from '../../../shared/ui/index.js';
import { getClaim } from '../api.js';
import { useLoad } from '../hooks/useLoad.js';
import { formatDateTime, ticketOf } from '../format.js';
import { AnswerSteps } from '../components/AnswerSteps.jsx';
import { LockoutNotice } from '../components/LockoutNotice.jsx';
import { HandoverCode } from '../components/HandoverCode.jsx';
import { FinderConfirm } from '../components/FinderConfirm.jsx';

function StatusPanel({ claim, isFinder, reload, onAnswered }) {
  switch (claim.status) {
    case 'answering':
      return <AnswerSteps key={claim.attemptsLeft} claim={claim} onDone={onAnswered} />;
    case 'locked':
      return <LockoutNotice lockedUntil={claim.lockedUntil} onUnlock={reload} />;
    case 'awaiting_handler':
      return (
        <p className="notice">Your answers matched. The desk will check your claim and decide.</p>
      );
    case 'approved':
      return claim.handover.custodyType === 'desk' ? (
        <HandoverCode claim={claim} />
      ) : (
        <FinderConfirm claim={claim} isFinder={isFinder} onConfirmed={reload} />
      );
    case 'rejected':
      return (
        <p className="notice">
          Not approved. {claim.decisionNote} Ask at the desk if you think this is wrong.
        </p>
      );
    case 'released':
      return <p className="notice">Collected on {formatDateTime(claim.timeline[3].at)}.</p>;
    default:
      return null;
  }
}

export function ClaimPage() {
  const { id } = useParams();
  const toast = useToast();
  const load = useCallback(() => getClaim(id), [id]);
  const { data: claim, loading, error, reload } = useLoad(load);

  function handleAnswered(result) {
    toast(
      result.passed
        ? 'Answers matched. Sent to the desk.'
        : `Not quite. ${result.attemptsLeft} tries left.`
    );
    reload();
  }

  if (loading && !claim) return <Spinner />;
  if (error) return <p className="field-error page">{error}</p>;

  return (
    <section className="page verify-page">
      <PageHeader title={`Claim ${claim.serial}`} actions={<Stamp status={claim.status} />} />
      {claim.item ? <PropertyTag item={ticketOf(claim.item)} compact /> : null}
      <div className="claim-panel">
        <StatusPanel
          claim={claim}
          isFinder={claim.viewerIsFinder}
          reload={reload}
          onAnswered={handleAnswered}
        />
      </div>
      <Timeline steps={claim.timeline.map((step) => ({ ...step, at: formatDateTime(step.at) }))} />
    </section>
  );
}
