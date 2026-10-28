// Form for adding a saved item.
import { useState } from 'react';
import {
  Button,
  ChipSelect,
  ColorPicker,
  Field,
  TextArea,
  TextInput,
} from '../../../shared/ui/index.js';
import { errorMessage } from '../../../shared/api/client.js';
import { createSavedItem } from '../api.js';
import { CATEGORY_TILES } from '../utils/reportSteps.js';

const EMPTY = { label: '', category: '', colors: [], brand: '', description: '', stickers: '' };

export function SavedItemForm({ onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.category) {
      setError('Choose what kind of item it is.');
      return;
    }
    setBusy(true);
    try {
      await createSavedItem(form);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form className="saved-form" onSubmit={handleSubmit}>
      <Field label="Name" hint='For example "My water bottle"'>
        <TextInput
          value={form.label}
          onChange={(event) => update({ label: event.target.value })}
          required
        />
      </Field>
      <ChipSelect
        options={CATEGORY_TILES}
        value={form.category}
        onChange={(category) => update({ category })}
      />
      <ColorPicker value={form.colors} onChange={(colors) => update({ colors })} />
      <Field label="Brand" hint="Optional">
        <TextInput value={form.brand} onChange={(event) => update({ brand: event.target.value })} />
      </Field>
      <Field label="Description" hint="Optional. Size, model, what is inside.">
        <TextArea
          rows={2}
          value={form.description}
          onChange={(event) => update({ description: event.target.value })}
        />
      </Field>
      <Field label="Stickers or marks" hint="Optional. Only you would know these.">
        <TextInput
          value={form.stickers}
          onChange={(event) => update({ stickers: event.target.value })}
        />
      </Field>
      {error ? <p className="field-error">{error}</p> : null}
      <Button type="submit" size="lg" icon="check" loading={busy}>
        Save item
      </Button>
    </form>
  );
}
