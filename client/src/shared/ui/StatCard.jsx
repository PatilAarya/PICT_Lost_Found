// Card that shows one number with a label.
import { Icon } from './Icon.jsx';

export function StatCard({ value, unit, label, hint, icon, tone = 'normal' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        {icon ? (
          <span className="stat-icon">
            <Icon name={icon} size={22} />
          </span>
        ) : null}
        <span className="stat-label">{label}</span>
      </div>
      <p className="stat-value tabular">
        {value}
        {unit ? <small> {unit}</small> : null}
      </p>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </div>
  );
}
