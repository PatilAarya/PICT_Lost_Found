// Asks the ownership questions one at a time.
import { useState } from 'react';
import { errorMessage } from '../../../shared/api/client.js';
import { Button, Field, Stepper, TextInput } from '../../../shared/ui/index.js';
import { sendAnswers } from '../api.js';

export function AnswerSteps({ claim, onDone }) {
  const [step, setStep] = useState(0);
  const [texts, setTexts] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const prompt = claim.prompts[step];
  const isLast = step === claim.prompts.length - 1;

  function handleChange(event) {
    setTexts({ ...texts, [prompt.promptKey]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!(texts[prompt.promptKey] || '').trim()) {
      setError('Type an answer. A short description is enough.');
      return;
    }
    setError('');
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      const answers = claim.prompts.map((item) => ({
        promptKey: item.promptKey,
        text: texts[item.promptKey],
      }));
      onDone(await sendAnswers(claim.id, answers));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="answer-steps" onSubmit={handleSubmit} noValidate>
      <Stepper
        steps={claim.prompts.map((_item, index) => `Question ${index + 1}`)}
        current={step}
      />
      <p className="tries-left tabular">
        {claim.attemptsLeft} {claim.attemptsLeft === 1 ? 'try' : 'tries'} left
      </p>
      <Field label={prompt.promptText} hint="Only the owner would know this." error={error}>
        <TextInput
          key={prompt.promptKey}
          value={texts[prompt.promptKey] || ''}
          onChange={handleChange}
          maxLength={200}
          autoFocus
        />
      </Field>
      <div className="button-row">
        {step > 0 ? (
          <Button variant="quiet" icon="arrow-left" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : null}
        <Button type="submit" loading={busy} icon={isLast ? 'check' : 'arrow-right'}>
          {isLast ? 'Send answers' : 'Next'}
        </Button>
      </div>
    </form>
  );
}
