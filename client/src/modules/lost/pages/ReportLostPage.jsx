// Page for reporting a lost item step by step.
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader, PropertyTag, StepCard, Stepper, useToast } from '../../../shared/ui/index.js';
import { errorMessage } from '../../../shared/api/client.js';
import { createReport, getSavedItems, uploadLostPhoto } from '../api.js';
import { useObjectUrl } from '../../../shared/media/useObjectUrl.js';
import { ReportStepBody } from '../components/ReportStepBody.jsx';
import { STEPS, canContinue, emptyReport, reportFromSaved } from '../utils/reportSteps.js';
import { ticketFromReport } from '../utils/format.js';
import '../lost.css';

const LAST_STEP = STEPS.length - 1;

function toRequestBody(form, imageUrl) {
  return {
    category: form.category,
    title: form.title,
    description: form.description,
    colors: form.colors,
    brand: form.brand,
    imageUrl: imageUrl || undefined,
    lastSeen: form.lastSeen,
    lostFrom: new Date(form.lostFrom).toISOString(),
    lostTo: new Date(form.lostTo).toISOString(),
    savedItemId: form.savedItemId || undefined,
    saveForLater: form.saveForLater,
  };
}

export function ReportLostPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const [form, setForm] = useState(emptyReport);
  const [savedItems, setSavedItems] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const previewUrl = useObjectUrl(form.photo);

  useEffect(() => {
    const savedId = params.get('saved');
    getSavedItems()
      .then((items) => {
        setSavedItems(items);
        const chosen = items.find((item) => item._id === savedId);
        if (chosen) setForm(reportFromSaved(chosen));
      })
      .catch(() => setSavedItems([]));
  }, [params]);

  function update(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit() {
    setBusy(true);
    try {
      const imageUrl = form.photo ? await uploadLostPhoto(form.photo) : '';
      const { report, matchCount } = await createReport(toRequestBody(form, imageUrl));
      toast(
        matchCount > 0
          ? `Reported. We already found ${matchCount} possible ${matchCount === 1 ? 'match' : 'matches'}.`
          : 'Reported. We will alert you when a matching item is handed in.'
      );
      navigate(`/lost/${report._id}`);
    } catch (err) {
      toast(errorMessage(err));
      setBusy(false);
    }
  }

  const step = STEPS[stepIndex];
  const isLast = stepIndex === LAST_STEP;
  return (
    <section className="page">
      <PageHeader title="Report a lost item" />
      <Stepper steps={STEPS.map((item) => item.name)} current={stepIndex} />
      <div className="post-layout">
        <StepCard
          title={step.title}
          hint={step.hint}
          onBack={stepIndex > 0 ? () => setStepIndex(stepIndex - 1) : null}
          onNext={isLast ? handleSubmit : () => setStepIndex(stepIndex + 1)}
          nextLabel={isLast ? 'Report lost item' : 'Next'}
          nextIcon={isLast ? 'check' : 'arrow-right'}
          nextDisabled={!canContinue(stepIndex, form)}
          nextLoading={busy}
        >
          <ReportStepBody
            stepIndex={stepIndex}
            form={form}
            update={update}
            savedItems={savedItems}
            onUseSaved={(item) => setForm(reportFromSaved(item))}
          />
        </StepCard>
        <aside className="card post-aside">
          <h2 className="card-title">Your report</h2>
          <p className="card-subtitle">Only you and the security desk can see it.</p>
          <PropertyTag
            item={ticketFromReport({
              ...form,
              serial: '',
              status: 'open',
              title: form.title || 'Your lost item',
              imageUrl: previewUrl,
              category: form.category || 'other',
            })}
          />
          <p className="post-tip">
            <strong>Tip:</strong> {step.tip}
          </p>
        </aside>
      </div>
    </section>
  );
}
