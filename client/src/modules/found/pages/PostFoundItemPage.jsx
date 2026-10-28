// The full "post a found item" flow: category, photos, colour and
// description, hidden details, location, desk, review, then submit.
// Each step is a small component; this page only tracks which step is
// current and holds the shared form state from useFoundItemForm.
import { useState } from 'react';
import {
  Stepper,
  Button,
  Field,
  TextInput,
  TextArea,
  ChipSelect,
  PropertyTag,
  PageHeader,
  Pictogram,
  useToast,
} from '../../../shared/ui/index.js';
import { LocationPicker } from '../../../shared/location-picker/LocationPicker.jsx';
import { CATEGORIES } from '../../../shared/constants.js';
import { api, errorMessage } from '../../../shared/api/client.js';
import { useFoundItemForm } from '../hooks/useFoundItemForm.js';
import { useFoundImages } from '../hooks/useFoundImages.js';
import CameraCapture from '../components/CameraCapture.jsx';
import PhotoBlurStep from '../components/PhotoBlurStep.jsx';
import ColorSuggestion from '../components/ColorSuggestion.jsx';
import HiddenDetailsStep from '../components/HiddenDetailsStep.jsx';
import DeskStep from '../components/DeskStep.jsx';
import { answeredCount, formatDateTime, placeLabel } from '../utils/format.js';

const STEPS = [
  'Category',
  'Photos',
  'Check photos',
  'Describe',
  'Secret detail',
  'Place',
  'Desk',
  'Review',
];

// `category` on each option makes ChipSelect draw a tile with the pictogram.
const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({
  value: category,
  label: category.replace('_', ' '),
  category,
}));
const MIN_ANSWERS = 2;

export default function PostFoundItemPage() {
  const { form, update, reset } = useFoundItemForm();
  const { uploadAll, uploading } = useFoundImages();
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [postedItem, setPostedItem] = useState(null);
  const toast = useToast();

  function next() {
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  // Runs once every photo has been through the blur editor, then moves on.
  function handlePhotosConfirmed(confirmedPhotos) {
    update({ confirmedPhotos });
    next();
  }

  // Uploads every photo, then sends the finished item to the server.
  async function handleSubmit() {
    setSubmitting(true);
    try {
      const images = await uploadAll(form.confirmedPhotos);
      const response = await api.post('/found/items', {
        category: form.category,
        title: form.title,
        description: form.description,
        colors: form.colors,
        brand: form.brand,
        images,
        location: form.location,
        foundAt: new Date(form.foundAt).toISOString(),
        custody: form.custody,
        // Blank answers are left out; the server needs at least two real ones.
        hiddenDetails: form.hiddenDetails.filter((detail) => detail.answer.trim() !== ''),
        aiSuggestion: form.aiSuggestion || undefined,
      });
      setPostedItem(response.data.item);
      toast('Found item posted.');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }
  // After a successful post, show the result as a ticket instead of the form.
  if (postedItem) {
    return (
      <div className="post-found-item">
        <PageHeader title="Item posted" subtitle="Thank you for reporting this." />
        <PropertyTag
          item={{
            kind: 'found',
            serial: postedItem.serial,
            category: postedItem.category,
            title: postedItem.title,
            status: postedItem.status,
            locationLabel: placeLabel(postedItem.location),
            timeLabel: formatDateTime(postedItem.foundAt),
            imageUrl: postedItem.images?.[0]?.publicUrl,
          }}
        />
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            reset();
            setPostedItem(null);
            setStepIndex(0);
          }}
        >
          Post another item
        </Button>
      </div>
    );
  }

  return (
    <div className="post-found-item">
      <PageHeader title="Post a found item" />
      <Stepper steps={STEPS} current={stepIndex} />

      {stepIndex === 0 && (
        <div className="post-found-item__step">
          <ChipSelect
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={(category) => update({ category })}
          />
          {form.category && <Pictogram category={form.category} size={48} />}
          <Button
            variant="primary"
            size="lg"
            icon="arrow-right"
            onClick={next}
            disabled={!form.category}
          >
            Next
          </Button>
        </div>
      )}

      {stepIndex === 1 && (
        <div className="post-found-item__step">
          <CameraCapture photos={form.photos} onPhotosChange={(photos) => update({ photos })} />
          <Button variant="quiet" size="md" icon="arrow-left" onClick={back}>
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon="arrow-right"
            onClick={next}
            disabled={form.photos.length === 0}
          >
            Next
          </Button>
        </div>
      )}

      {stepIndex === 2 && (
        <PhotoBlurStep photos={form.photos} onAllConfirmed={handlePhotosConfirmed} />
      )}

      {stepIndex === 3 && (
        <div className="post-found-item__step">
          <Field label="Title">
            <TextInput
              value={form.title}
              onChange={(event) => update({ title: event.target.value })}
            />
          </Field>
          <Field label="Description" hint="Optional">
            <TextArea
              value={form.description}
              onChange={(event) => update({ description: event.target.value })}
            />
          </Field>
          <Field label="Brand" hint="Optional">
            <TextInput
              value={form.brand}
              onChange={(event) => update({ brand: event.target.value })}
            />
          </Field>
          <ColorSuggestion
            firstPhotoBlob={form.photos[0]?.blob}
            value={form.colors}
            onChange={(colors) => update({ colors })}
            onSuggestionReady={(aiSuggestion) => update({ aiSuggestion })}
          />
          <Button variant="quiet" size="md" icon="arrow-left" onClick={back}>
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon="arrow-right"
            onClick={next}
            disabled={!form.title}
          >
            Next
          </Button>
        </div>
      )}

      {stepIndex === 4 && (
        <div className="post-found-item__step">
          <HiddenDetailsStep
            category={form.category}
            value={form.hiddenDetails}
            onChange={(hiddenDetails) => update({ hiddenDetails })}
          />
          <Button variant="quiet" size="md" icon="arrow-left" onClick={back}>
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon="arrow-right"
            onClick={next}
            disabled={answeredCount(form.hiddenDetails) < MIN_ANSWERS}
          >
            Next
          </Button>
        </div>
      )}

      {stepIndex === 5 && (
        <div className="post-found-item__step">
          <PageHeader title="Where did you find it?" />
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
          <Button variant="quiet" size="md" icon="arrow-left" onClick={back}>
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon="arrow-right"
            onClick={next}
            disabled={!form.location}
          >
            Next
          </Button>
        </div>
      )}

      {stepIndex === 6 && (
        <div className="post-found-item__step">
          <DeskStep
            location={form.location}
            value={form.custody}
            onChange={(custody) => update({ custody })}
          />
          <Button variant="quiet" size="md" icon="arrow-left" onClick={back}>
            Back
          </Button>
          <Button variant="primary" size="lg" icon="arrow-right" onClick={next}>
            Next
          </Button>
        </div>
      )}

      {stepIndex === 7 && (
        <div className="post-found-item__step">
          <PageHeader title="Review" subtitle="Check everything before posting." />
          <PropertyTag
            item={{
              kind: 'found',
              serial: '',
              category: form.category,
              title: form.title,
              status: 'posted',
              locationLabel: placeLabel(form.location),
              timeLabel: formatDateTime(form.foundAt),
              imageUrl: form.confirmedPhotos[0]
                ? URL.createObjectURL(form.confirmedPhotos[0].publicBlob)
                : undefined,
            }}
          />
          <Button variant="quiet" size="md" icon="arrow-left" onClick={back}>
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon="check"
            loading={submitting || uploading}
            onClick={handleSubmit}
          >
            Post found item
          </Button>
        </div>
      )}
    </div>
  );
}
