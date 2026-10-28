// The handler's view of one claim, inside a Sheet: who is claiming, the clear photos,
// each secret question with the claimant's answer beside the finder's answer and a
// score, then Reject or Approve with a note. Calls onDecided after the decision is saved.
import { useState } from 'react';
import { errorMessage } from '../../../../shared/api/client.js';
import { Button, Field, TextArea } from '../../../../shared/ui/index.js';
import { decideClaim } from '../../api.js';
import { percent } from '../../format.js';
import { ScoreMeter } from './ScoreMeter.jsx';

// One question: both answers side by side and how closely they match.
function AnswerCard({ row }) {
  return (
    <li className="answer-card">
      <p className="answer-question">{row.promptText}</p>
      <div className="answer-pair">
        <div>
          <span className="answer-label">Claimant said</span>
          <p>{row.given || 'No answer'}</p>
        </div>
        <div>
          <span className="answer-label">Finder said</span>
          <p>{row.expected}</p>
        </div>
      </div>
      <span className="answer-score tabular">{percent(row.score)} alike</span>
    </li>
  );
}

// The claimant's name, department and year, with a warning if the account is flagged.
function ClaimantLine({ claimant }) {
  if (!claimant) return null;
  return (
    <div className="claimant-line">
      <strong>{claimant.name}</strong>
      <span className="muted">
        {[claimant.department, claimant.year, claimant.email].filter(Boolean).join(' · ')}
      </span>
      {claimant.flagged ? <span className="flag-tag">Account flagged</span> : null}
    </div>
  );
}

export function ClaimReview({ claim, onDecided }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  // Save "approve" or "reject" with the note.
  async function decide(decision) {
    setBusy(decision);
    try {
      await decideClaim(claim.id, decision, note);
      onDecided(decision);
    } catch (err) {
      setError(errorMessage(err));
      setBusy('');
    }
  }

  const photos = claim.photos.filter((photo) => photo.url);
  return (
    <div className="claim-review">
      <div className="claim-review-top">
        <ClaimantLine claimant={claim.claimant} />
        <ScoreMeter score={claim.score} />
      </div>
      {photos.length > 0 ? (
        <div className="photo-row">
          {photos.map((photo) => (
            <img key={photo.order} src={photo.url} alt={`Clear photo ${photo.order + 1}`} />
          ))}
        </div>
      ) : (
        <p className="notice">Clear photos are only available when Cloudinary is set up.</p>
      )}
      <h3 className="claim-review-heading">Secret questions</h3>
      <ul className="answer-list">
        {claim.comparisons.map((row) => (
          <AnswerCard key={row.promptKey} row={row} />
        ))}
      </ul>
      <Field label="Note for the claimant" hint="Optional. They see this with your decision.">
        <TextArea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={300}
          rows={2}
        />
      </Field>
      {error ? <p className="field-error">{error}</p> : null}
      <div className="button-row button-row-split">
        <Button
          variant="danger"
          icon="close"
          loading={busy === 'reject'}
          onClick={() => decide('reject')}
        >
          Reject
        </Button>
        <Button
          size="lg"
          icon="check"
          loading={busy === 'approve'}
          onClick={() => decide('approve')}
        >
          Approve and send code
        </Button>
      </div>
    </div>
  );
}
