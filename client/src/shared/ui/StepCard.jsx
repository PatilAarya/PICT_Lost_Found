// One step of a multi-step form (post found item, report lost item), drawn as a card: a title, one line of help,
// the step's own fields, and a footer with Back on the left and the main action on the
// right, so the two buttons are always apart and always in the same place.
import { Button } from './Button.jsx';

export function StepCard({
  title,
  hint,
  children,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextIcon = 'arrow-right',
  nextDisabled = false,
  nextLoading = false,
  hideNext = false,
}) {
  return (
    <div className="card step-card">
      <h2 className="card-title">{title}</h2>
      {hint ? <p className="card-subtitle">{hint}</p> : null}
      <div className="step-body">{children}</div>
      <div className="button-row button-row-split step-footer">
        {onBack ? (
          <Button variant="quiet" icon="arrow-left" onClick={onBack}>
            Back
          </Button>
        ) : (
          <span />
        )}
        {hideNext ? null : (
          <Button
            size="lg"
            icon={nextIcon}
            onClick={onNext}
            disabled={nextDisabled}
            loading={nextLoading}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
