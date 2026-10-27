// Desk tab 2: release an item. The handler picks the approved claim, types the
// owner's 6-digit code and ticks "college ID checked". The browser's own form
// validation (required, pattern) stops an incomplete form before it is sent.
import { useState } from 'react';
import { errorMessage } from '../../../../shared/api/client.js';
import { Button, EmptyState, Field, TextInput, useToast } from '../../../../shared/ui/index.js';
import { getApproved, releaseItem } from '../../api.js';
import { useLoad } from '../../hooks/useLoad.js';
import { formatDateTime } from '../../format.js';

export function ReleaseTab() {
  const toast = useToast();
  const { data: claims, loading, error, reload } = useLoad(getApproved);
  const [claimId, setClaimId] = useState('');
  const [code, setCode] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  // Send the code; on success clear the form and refresh the list.
  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      await releaseItem(claimId, code);
      toast('Released. The item is back with its owner.');
      setClaimId('');
      setCode('');
      setIdChecked(false);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading && !claims) return <p>Loading</p>;
  if (error) return <p className="field-error">{error}</p>;
  if (claims.length === 0) return <EmptyState title="No approved items waiting to be collected." />;

  return (
    <form className="release-form" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Which claim?</legend>
        {claims.map((claim) => (
          <label key={claim.id} className="radio-row">
            <input
              type="radio"
              name="claim"
              value={claim.id}
              checked={claimId === claim.id}
              onChange={() => setClaimId(claim.id)}
              required
            />
            <span className="tabular">{claim.serial}</span> {claim.item.title}, {claim.claimantName}
            <span className="muted"> until {formatDateTime(claim.expiresAt)}</span>
          </label>
        ))}
      </fieldset>
      <Field label="Handover code" hint="6 digits on the owner's screen" error={formError}>
        <TextInput
          className="input code-input tabular"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
        />
      </Field>
      <label className="check-row">
        <input
          type="checkbox"
          checked={idChecked}
          onChange={(event) => setIdChecked(event.target.checked)}
          required
        />
        I checked the owner's college ID
      </label>
      <Button type="submit" size="lg" icon="check" loading={busy}>
        Release item
      </Button>
    </form>
  );
}
