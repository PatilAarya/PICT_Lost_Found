// Small layout pieces: page header, empty state, spinner, timeline and stepper.
import { EmptyArt } from './pictograms/EmptyArt.jsx';
import './layout.css';
import './progress.css';

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

export function Spinner() {
  return (
    <div className="spinner" role="status">
      <span className="visually-hidden">Loading</span>
    </div>
  );
}

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

function stepState(index, current) {
  if (index < current) return 'done';
  if (index === current) return 'current';
  return 'todo';
}

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
