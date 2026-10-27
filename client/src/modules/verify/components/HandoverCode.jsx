// The 6-digit handover code, printed large on a ticket stub. The server shows it
// only ONCE, so we ask the claimant to open it at the desk, by pressing a button
// (not automatically on page load, which could waste the single view).
import { useState } from 'react';
import { errorMessage } from '../../../shared/api/client.js';
import { Button } from '../../../shared/ui/index.js';
import { revealCode } from '../api.js';
import { formatDateTime } from '../format.js';

export function HandoverCode({ claim }) {
  const [code, setCode] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Ask the server for the code (works one time only).
  async function handleReveal() {
    setBusy(true);
    try {
      setCode(await revealCode(claim.id));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (code) {
    return (
      <div className="code-stub">
        <span className="code-stub-label">Handover code</span>
        <span className="code-digits tabular" aria-label={code.code.split('').join(' ')}>
          {code.code}
        </span>
        <p>
          Show this code and your college ID at the desk. It works until{' '}
          {formatDateTime(code.expiresAt)}.
        </p>
      </div>
    );
  }
  if (!claim.handover.codeReady) {
    return (
      <p className="notice">
        Your code was already shown on {formatDateTime(claim.handover.codeShownAt)}. If you lost it,
        ask at the desk.
      </p>
    );
  }
  return (
    <div className="code-reveal">
      <p>You can see the code only once. Open it when you are at the desk.</p>
      <Button size="lg" icon="lock" loading={busy} onClick={handleReveal}>
        Show my code
      </Button>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
