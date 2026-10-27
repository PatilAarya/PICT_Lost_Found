// The handler's view of one claim, inside a Sheet: the clear photos, each question
// with the claimant's answer next to the finder's answer and a score bar, and
// Approve / Reject with a note. Calls onDecided after the decision is saved.
import { useState } from 'react';
import { errorMessage } from '../../../../shared/api/client.js';
import { Button, Field, TextArea } from '../../../../shared/ui/index.js';
import { decideClaim } from '../../api.js';
import { percent } from '../../format.js';

// One row: question, both answers, and a bar as wide as the score.
function ComparisonRow({ row }) {
  return (
    <tr>
      <th scope="row">{row.promptText}</th>
      <td>{row.given}</td>
      <td>{row.expected}</td>
      <td>
        <span className="score-bar" style={{ '--score': row.score }} aria-hidden="true" />
        <span className="tabular">{percent(row.score)}</span>
      </td>
    </tr>
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

  return (
    <div className="claim-review">
      <p>
        <strong>{claim.claimant.name}</strong> {claim.claimant.department} {claim.claimant.year}
        {claim.claimant.flagged ? <span className="flag-tag">Flagged</span> : null}
      </p>
      <div className="photo-row">
        {claim.photos.map((photo) =>
          photo.url ? (
            <img
              key={photo.order}
              src={photo.url}
              alt={`Clear photo ${photo.order + 1}`}
              loading="lazy"
            />
          ) : (
            <p key={photo.order} className="notice">
              Clear photo not available (Cloudinary not set up).
            </p>
          )
        )}
      </div>
      <table className="compare-table">
        <thead>
          <tr>
            <th scope="col">Question</th>
            <th scope="col">Claimant said</th>
            <th scope="col">Finder said</th>
            <th scope="col">Match</th>
          </tr>
        </thead>
        <tbody>
          {claim.comparisons.map((row) => (
            <ComparisonRow key={row.promptKey} row={row} />
          ))}
        </tbody>
      </table>
      <Field label="Note" hint="The claimant sees this note.">
        <TextArea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={300}
          rows={2}
        />
      </Field>
      <div className="button-row">
        <Button
          variant="secondary"
          icon="check"
          loading={busy === 'approve'}
          onClick={() => decide('approve')}
        >
          Approve
        </Button>
        <Button
          variant="danger"
          icon="close"
          loading={busy === 'reject'}
          onClick={() => decide('reject')}
        >
          Reject
        </Button>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
