// STUB layout pieces from the contract that are only a few lines each:
// PageHeader { title, subtitle, actions }, EmptyState { title, action, illustration },
// Spinner, Timeline { steps }, Stepper { steps, current }. Member 1 restyles them.

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
  return (
    <div className="empty-state">
      {illustration}
      <p>{title}</p>
      {action}
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

// A vertical list of steps: [{ label, done, at }].
export function Timeline({ steps = [] }) {
  return (
    <ol className="timeline">
      {steps.map((step) => (
        <li key={step.label} className={step.done ? 'timeline-done' : ''}>
          <span>{step.label}</span>
          {step.at ? <span className="timeline-time tabular">{step.at}</span> : null}
        </li>
      ))}
    </ol>
  );
}

// "Step 2 of 4" progress for multi-step forms. steps: ['Photo', 'Details', ...].
export function Stepper({ steps = [], current = 0 }) {
  return (
    <ol className="stepper" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((label, index) => (
        <li key={label} aria-current={index === current ? 'step' : undefined}>
          {label}
        </li>
      ))}
    </ol>
  );
}
