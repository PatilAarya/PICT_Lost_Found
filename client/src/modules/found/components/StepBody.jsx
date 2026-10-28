// Fields shown in each step of posting a found item.
import { ChipSelect, Field, TextArea, TextInput } from '../../../shared/ui/index.js';
import { LocationPicker } from '../../../shared/location-picker/LocationPicker.jsx';
import { CATEGORIES } from '../../../shared/constants.js';
import CameraCapture from './CameraCapture.jsx';
import PhotoBlurStep from './PhotoBlurStep.jsx';
import ColorSuggestion from './ColorSuggestion.jsx';
import HiddenDetailsStep from './HiddenDetailsStep.jsx';
import DeskStep from './DeskStep.jsx';
import ReviewSummary from './ReviewSummary.jsx';

const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({
  value: category,
  label: category.replace('_', ' '),
  category,
}));

function DetailsFields({ form, update }) {
  return (
    <>
      <Field label="Title" hint='For example "Blue steel water bottle"'>
        <TextInput value={form.title} onChange={(event) => update({ title: event.target.value })} />
      </Field>
      <Field label="Description" hint="Optional. Where exactly, and anything that stands out.">
        <TextArea
          rows={3}
          value={form.description}
          onChange={(event) => update({ description: event.target.value })}
        />
      </Field>
      <Field label="Brand" hint="Optional">
        <TextInput value={form.brand} onChange={(event) => update({ brand: event.target.value })} />
      </Field>
      <ColorSuggestion
        firstPhotoBlob={form.photos[0]?.blob}
        value={form.colors}
        onChange={(colors) => update({ colors })}
        onSuggestionReady={(aiSuggestion) => update({ aiSuggestion })}
      />
    </>
  );
}

function PlaceFields({ form, update }) {
  return (
    <>
      <LocationPicker
        value={form.location}
        onChange={(location) => update({ location })}
        mode="pin"
      />
      <Field label="When did you find it?">
        <TextInput
          type="datetime-local"
          value={form.foundAt}
          onChange={(event) => update({ foundAt: event.target.value })}
        />
      </Field>
    </>
  );
}

export default function StepBody({ stepIndex, form, update, onPhotosConfirmed }) {
  if (stepIndex === 0) {
    return (
      <ChipSelect
        options={CATEGORY_OPTIONS}
        value={form.category}
        onChange={(category) => update({ category })}
      />
    );
  }
  if (stepIndex === 1) {
    return <CameraCapture photos={form.photos} onPhotosChange={(photos) => update({ photos })} />;
  }
  if (stepIndex === 2) {
    return <PhotoBlurStep photos={form.photos} onAllConfirmed={onPhotosConfirmed} />;
  }
  if (stepIndex === 3) return <DetailsFields form={form} update={update} />;
  if (stepIndex === 4) {
    return (
      <HiddenDetailsStep
        category={form.category}
        value={form.hiddenDetails}
        onChange={(hiddenDetails) => update({ hiddenDetails })}
      />
    );
  }
  if (stepIndex === 5) return <PlaceFields form={form} update={update} />;
  if (stepIndex === 6) {
    return (
      <DeskStep
        location={form.location}
        value={form.custody}
        onChange={(custody) => update({ custody })}
      />
    );
  }
  return <ReviewSummary form={form} />;
}
