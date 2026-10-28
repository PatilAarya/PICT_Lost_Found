// Collects the finder's answers to the secret questions.
import { useEffect, useState } from 'react';
import { Field, TextArea } from '../../../shared/ui/index.js';
import { api } from '../../../shared/api/client.js';

export default function HiddenDetailsStep({ category, value, onChange }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/found/hidden-detail-prompts', { params: { category } }).then((response) => {
      if (!cancelled) {
        setPrompts(response.data.prompts);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  function setAnswer(promptKey, promptText, answer) {
    const others = value.filter((item) => item.promptKey !== promptKey);
    onChange([...others, { promptKey, promptText, answer }]);
  }

  if (loading) return <p>Loading questions...</p>;

  return (
    <div className="hidden-details-step">
      {prompts.map((prompt) => {
        const current = value.find((item) => item.promptKey === prompt.promptKey);
        return (
          <Field key={prompt.promptKey} label={prompt.promptText}>
            <TextArea
              rows={2}
              value={current?.answer || ''}
              onChange={(event) =>
                setAnswer(prompt.promptKey, prompt.promptText, event.target.value)
              }
            />
          </Field>
        );
      })}
    </div>
  );
}
