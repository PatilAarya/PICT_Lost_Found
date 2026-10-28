// Summary of everything entered before posting a found item.
import { answeredCount, formatDateTime, placeLabel } from '../utils/format.js';

export default function ReviewSummary({ form }) {
  const rows = [
    ['Category', form.category.replace('_', ' ')],
    ['Title', form.title],
    ['Colours', form.colors.length > 0 ? form.colors.join(', ') : 'Not given'],
    ['Photos', `${form.confirmedPhotos.length} (blurred copies are public)`],
    ['Secret answers', `${answeredCount(form.hiddenDetails)} answered`],
    ['Found at', placeLabel(form.location)],
    ['Found on', formatDateTime(form.foundAt)],
    ['Drop-off', form.custody.type === 'desk' ? 'At a desk' : 'I will keep it and meet the owner'],
  ];
  return (
    <dl className="review-list">
      {rows.map(([label, value]) => (
        <div key={label} className="review-row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
