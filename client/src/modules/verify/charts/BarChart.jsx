// A horizontal bar chart in plain SVG: one row per label, the bar's width comes from
// linearScale(), and the number is written at the end of the bar (a direct label,
// so no legend is needed). Colours follow DESIGN.md: main series --ink, grid --frost.
// The card around it (in AnalyticsPage.jsx) gives the title and the explanation.
import { linearScale, maxCount } from './scale.js';

const ROW_HEIGHT = 34;
const LABEL_WIDTH = 190;
const BAR_AREA = 300;
const NUMBER_SPACE = 44;
const MAX_LABEL = 26;

// "id_card" becomes "id card", and very long names are shortened with "...".
function readableLabel(label) {
  const text = String(label).replaceAll('_', ' ');
  return text.length > MAX_LABEL ? `${text.slice(0, MAX_LABEL - 1)}...` : text;
}

export function BarChart({ title, rows, highlightFirst = true }) {
  const toWidth = linearScale(maxCount(rows), BAR_AREA);
  const height = Math.max(rows.length, 1) * ROW_HEIGHT;
  const width = LABEL_WIDTH + BAR_AREA + NUMBER_SPACE;

  if (rows.length === 0) {
    return <p className="muted">No items in this period.</p>;
  }
  return (
    <svg
      className="chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${title}: ${rows.map((row) => `${row.label} ${row.count}`).join(', ')}`}
    >
      <line x1={LABEL_WIDTH} y1="0" x2={LABEL_WIDTH} y2={height} className="chart-grid" />
      {rows.map((row, index) => {
        const y = index * ROW_HEIGHT;
        const barWidth = toWidth(row.count);
        return (
          <g key={row.label}>
            <title>{`${row.label}: ${row.count}`}</title>
            <text
              x={LABEL_WIDTH - 10}
              y={y + ROW_HEIGHT / 2}
              className="chart-label"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {readableLabel(row.label)}
            </text>
            <rect
              x={LABEL_WIDTH}
              y={y + 7}
              width={barWidth}
              height={ROW_HEIGHT - 14}
              rx="3"
              className={
                highlightFirst && index === 0 ? 'chart-bar chart-bar-highlight' : 'chart-bar'
              }
            />
            <text
              x={LABEL_WIDTH + barWidth + 8}
              y={y + ROW_HEIGHT / 2}
              className="chart-value tabular"
              dominantBaseline="middle"
            >
              {row.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
