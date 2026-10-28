// Fields shown in each step of reporting a lost item.
import {
  ChipSelect,
  ColorPicker,
  Field,
  PhotoPicker,
  Pictogram,
  TextArea,
  TextInput,
} from '../../../shared/ui/index.js';
import { LocationPicker } from '../../../shared/location-picker/LocationPicker.jsx';
import { CATEGORY_TILES } from '../utils/reportSteps.js';
import { ReportSummary } from './ReportSummary.jsx';

function CategoryStep({ form, update, savedItems, onUseSaved }) {
  return (
    <>
      {savedItems.length > 0 ? (
        <div className="saved-shortcuts">
          <p className="step-label">Your saved items</p>
          <div className="button-row">
            {savedItems.map((item) => (
              <button
                key={item._id}
                type="button"
                className="saved-shortcut"
                aria-pressed={form.savedItemId === item._id}
                onClick={() => onUseSaved(item)}
              >
                <Pictogram category={item.category} size={28} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <p className="step-label">Or pick a category</p>
        </div>
      ) : null}
      <ChipSelect
        options={CATEGORY_TILES}
        value={form.category}
        onChange={(category) => update({ category, savedItemId: '' })}
      />
    </>
  );
}

function DetailsStep({ form, update }) {
  return (
    <>
      <Field label="Name" hint='For example "Blue steel water bottle"'>
        <TextInput value={form.title} onChange={(event) => update({ title: event.target.value })} />
      </Field>
      <ColorPicker value={form.colors} onChange={(colors) => update({ colors })} />
      <Field label="Brand" hint="Optional">
        <TextInput value={form.brand} onChange={(event) => update({ brand: event.target.value })} />
      </Field>
      <Field
        label="Anything that stands out"
        hint="Optional. Stickers, scratches, what was inside."
      >
        <TextArea
          rows={3}
          value={form.description}
          onChange={(event) => update({ description: event.target.value })}
        />
      </Field>
      <div className="field">
        <p className="step-label">Photo (optional)</p>
        <p className="field-hint">An old photo of the item helps you recognise it among matches.</p>
        <PhotoPicker photo={form.photo} onChange={(photo) => update({ photo })} />
      </div>
    </>
  );
}

function WhenStep({ form, update }) {
  return (
    <div className="when-fields">
      <Field label="I last had it at">
        <TextInput
          type="datetime-local"
          value={form.lostFrom}
          onChange={(event) => update({ lostFrom: event.target.value })}
        />
      </Field>
      <Field
        label="I noticed it was gone at"
        error={form.lostTo < form.lostFrom ? 'This must be after the first time.' : ''}
      >
        <TextInput
          type="datetime-local"
          value={form.lostTo}
          onChange={(event) => update({ lostTo: event.target.value })}
        />
      </Field>
    </div>
  );
}

export function ReportStepBody({ stepIndex, form, update, savedItems, onUseSaved }) {
  if (stepIndex === 0) {
    return (
      <CategoryStep form={form} update={update} savedItems={savedItems} onUseSaved={onUseSaved} />
    );
  }
  if (stepIndex === 1) return <DetailsStep form={form} update={update} />;
  if (stepIndex === 2) {
    return (
      <LocationPicker
        value={form.lastSeen}
        onChange={(lastSeen) => update({ lastSeen })}
        mode="pin"
      />
    );
  }
  if (stepIndex === 3) return <WhenStep form={form} update={update} />;
  return <ReportSummary form={form} update={update} />;
}
