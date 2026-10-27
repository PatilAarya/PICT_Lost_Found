// For items the finder kept (not at a desk): the owner and the finder meet, then
// each presses "I handed it over" / "I got my item". The item is released once both
// have confirmed. Shows a tick for each side that has already confirmed.
import { useState } from 'react';
import { errorMessage } from '../../../shared/api/client.js';
import { Button, Icon } from '../../../shared/ui/index.js';
import { confirmHandover } from '../api.js';

export function FinderConfirm({ claim, isFinder, onConfirmed }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const mine = isFinder ? claim.handover.finderConfirmedAt : claim.handover.ownerConfirmedAt;

  // Record this person's confirmation.
  async function handleConfirm() {
    setBusy(true);
    try {
      onConfirmed(await confirmHandover(claim.id));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="finder-confirm">
      <ul className="confirm-list">
        <li className={claim.handover.ownerConfirmedAt ? 'confirmed' : ''}>
          <Icon name={claim.handover.ownerConfirmedAt ? 'check' : 'clock'} /> Owner
        </li>
        <li className={claim.handover.finderConfirmedAt ? 'confirmed' : ''}>
          <Icon name={claim.handover.finderConfirmedAt ? 'check' : 'clock'} /> Finder
        </li>
      </ul>
      {mine ? (
        <p className="notice">You confirmed. Waiting for the other person.</p>
      ) : (
        <Button loading={busy} icon="check" onClick={handleConfirm}>
          {isFinder ? 'I handed it over' : 'I got my item'}
        </Button>
      )}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
