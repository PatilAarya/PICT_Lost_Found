// Small layout pieces from the contract: PageHeader { title, subtitle, actions },
// EmptyState { title, action, illustration }, Spinner, Timeline { steps },
// Stepper { steps, current }. Styles are in layout.css and progress.css.
// EmptyState's illustration can be a name ('no-reports', 'no-matches',
// 'no-notifications') for the built-in art, or any element you pass in.
import { EmptyArt } from './pictograms/EmptyArt.jsx';
import './layout.css';
import './progress.css';

// The title row at the top of a page.
export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

// What to show when a list is empty, with an action to fill it.
export function EmptyState({ title, action, illustration }) {
  const art = typeof illustration === 'string' ? <EmptyArt name={illustration} /> : illustration;
  return (
    <div className="empty-state">
      {art}
      <p className="empty-title">{title}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}

// A loading indicator with a text label for screen readers.
export function Spinner() {
  return (
    <div className="spinner" role="status">
      <span className="visually-hidden">Loading</span>
    </div>
  );
}

// A vertical history: a dashed line with punched circles; done stops are filled.
// steps: [{ label, done, at }], where `at` is already formatted text.
export function Timeline({ steps = [] }) {
  return (
    <ol className="timeline">
      {steps.map((step, index) => (
        <li key={`${step.label}-${index}`} className={step.done ? 'timeline-done' : ''}>
          <span className="timeline-stop" aria-hidden="true" />
          <span className="timeline-label">{step.label}</span>
          {step.at ? <span className="timeline-time tabular">{step.at}</span> : null}
          <span className="visually-hidden">{step.done ? '(done)' : '(not yet)'}</span>
        </li>
      ))}
    </ol>
  );
}

// "done", "current" or "todo" for the step at `index`.
function stepState(index, current) {
  if (index < current) return 'done';
  if (index === current) return 'current';
  return 'todo';
}

// Progress for multi-step forms. steps: ['Photo', 'Details', ...].
// A row of segments shows how far along you are, and one line of text names the
// current and next step in full, so no step name is ever cut off on a small screen.
export function Stepper({ steps = [], current = 0 }) {
  const next = steps[current + 1];
  return (
    <div className="stepper">
      <ol className="stepper-bar" aria-label={`Step ${current + 1} of ${steps.length}`}>
        {steps.map((label, index) => (
          <li
            key={label}
            className={`stepper-${stepState(index, current)}`}
            aria-current={index === current ? 'step' : undefined}
          >
            <span className="visually-hidden">{label}</span>
          </li>
        ))}
      </ol>
      <p className="stepper-text">
        <span className="stepper-count tabular">
          Step {current + 1} of {steps.length}
        </span>
        <strong>{steps[current]}</strong>
        {next ? <span className="stepper-next">Next: {next}</span> : null}
      </p>
    </div>
  );
}
