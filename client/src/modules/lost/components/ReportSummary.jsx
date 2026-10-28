// The last step of "report lost item": everything entered, as label and value pairs,
// plus a checkbox to keep this item as a saved item for next time.
import { formatDateTime, placeLabel } from '../utils/format.js';

export function ReportSummary({ form, update }) {
  const rows = [
    ['Category', form.category.replace('_', ' ')],
    ['Name', form.title],
    ['Colours', form.colors.length > 0 ? form.colors.join(', ') : 'Not given'],
    ['Brand', form.brand || 'Not given'],
    ['Last seen', placeLabel(form.lastSeen)],
    ['Lost between', `${formatDateTime(form.lostFrom)} and ${formatDateTime(form.lostTo)}`],
  ];
  return (
    <>
      <dl className="review-list">
        {rows.map(([label, value]) => (
          <div key={label} className="review-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {form.savedItemId ? null : (
        <label className="check-line">
          <input
            type="checkbox"
            checked={form.saveForLater}
            onChange={(event) => update({ saveForLater: event.target.checked })}
          />
          <span>Also keep this as a saved item, so next time it takes one tap</span>
        </label>
      )}
    </>
  );
}
