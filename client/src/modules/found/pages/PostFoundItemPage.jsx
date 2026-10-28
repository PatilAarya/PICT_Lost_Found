// Page for posting a found item step by step.
import { useState } from 'react';
import { PageHeader, PropertyTag, StepCard, Stepper, useToast } from '../../../shared/ui/index.js';
import { api, errorMessage } from '../../../shared/api/client.js';
import { useFoundItemForm } from '../hooks/useFoundItemForm.js';
import { useFoundImages } from '../hooks/useFoundImages.js';
import { useObjectUrl } from '../../../shared/media/useObjectUrl.js';
import StepBody from '../components/StepBody.jsx';
import PostedSuccess from '../components/PostedSuccess.jsx';
import { STEPS, canContinue } from '../utils/steps.js';
import { ticketFromForm } from '../utils/ticket.js';
import '../found.css';

const BLUR_STEP = 2;
const LAST_STEP = STEPS.length - 1;

export default function PostFoundItemPage() {
  const { form, update, reset } = useFoundItemForm();
  const { uploadAll, uploading } = useFoundImages();
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [postedItem, setPostedItem] = useState(null);
  const toast = useToast();
  const previewUrl = useObjectUrl(form.confirmedPhotos[0]?.publicBlob || form.photos[0]?.blob);

  function next() {
    setStepIndex((index) => Math.min(index + 1, LAST_STEP));
  }
  function back() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function handlePhotosConfirmed(confirmedPhotos) {
    update({ confirmedPhotos });
    next();
  }

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

  function postAnother() {
    reset();
    setPostedItem(null);
    setStepIndex(0);
  }

  if (postedItem) {
    return <PostedSuccess item={postedItem} onPostAnother={postAnother} />;
  }

  const step = STEPS[stepIndex];
  const isLast = stepIndex === LAST_STEP;
  return (
    <section className="page">
      <PageHeader title="Post a found item" />
      <Stepper steps={STEPS.map((item) => item.name)} current={stepIndex} />
      <div className="post-layout">
        <StepCard
          title={step.title}
          hint={step.hint}
          onBack={stepIndex > 0 ? back : null}
          onNext={isLast ? handleSubmit : next}
          nextLabel={isLast ? 'Post found item' : 'Next'}
          nextIcon={isLast ? 'check' : 'arrow-right'}
          nextDisabled={!canContinue(stepIndex, form)}
          nextLoading={submitting || uploading}
          hideNext={stepIndex === BLUR_STEP}
        >
          <StepBody
            stepIndex={stepIndex}
            form={form}
            update={update}
            onPhotosConfirmed={handlePhotosConfirmed}
          />
        </StepCard>
        <aside className="card post-aside">
          <h2 className="card-title">Your ticket</h2>
          <p className="card-subtitle">This is how the item will appear to others.</p>
          <PropertyTag item={ticketFromForm(form, previewUrl)} />
          <p className="post-tip">
            <strong>Tip:</strong> {step.tip}
          </p>
        </aside>
      </div>
    </section>
  );
}
