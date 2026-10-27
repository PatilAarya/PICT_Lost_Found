// Shows the category-specific secret questions (from the found module's
// own prompt list on the server) and collects the finder's answers.
// These answers are what a claimant will later be asked to guess during
// the owner check, without ever seeing this item's photos.
import { useEffect, useState } from 'react';
import { Field, TextArea, PageHeader } from '../../../shared/ui/index.js';
import { api } from '../../../shared/api/client.js';

export default function HiddenDetailsStep({ category, value, onChange }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Loads the question list for this category once, when the step opens.
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

  // Updates one answer by its promptKey, keeping the others unchanged.
  function setAnswer(promptKey, promptText, answer) {
    const others = value.filter((item) => item.promptKey !== promptKey);
    onChange([...others, { promptKey, promptText, answer }]);
  }

  if (loading) return <p>Loading questions...</p>;

  return (
    <div className="hidden-details-step">
      <PageHeader
        title="Add a secret detail"
        subtitle="Answer at least two. Only the real owner should know these answers."
      />
      {prompts.map((prompt) => {
        const current = value.find((item) => item.promptKey === prompt.promptKey);
        return (
          // Field shows the question as a label tied to the box, so it is read aloud too.
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
