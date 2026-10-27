// A horizontal bar chart in plain SVG: one row per label, the bar's width comes from
// linearScale(), and the number is written at the end of the bar (a direct label,
// so no legend is needed). Colours follow DESIGN.md: main series --ink, grid --frost.
import { linearScale, maxCount } from './scale.js';

const ROW_HEIGHT = 32;
const LABEL_WIDTH = 150;
const BAR_AREA = 260;
const NUMBER_SPACE = 40;

export function BarChart({ title, rows, highlightFirst = true }) {
  const toWidth = linearScale(maxCount(rows), BAR_AREA);
  const height = rows.length * ROW_HEIGHT;
  const width = LABEL_WIDTH + BAR_AREA + NUMBER_SPACE;

  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <svg
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
              <text
                x={LABEL_WIDTH - 8}
                y={y + ROW_HEIGHT / 2}
                className="chart-label"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {row.label.length > 22 ? `${row.label.slice(0, 21)}...` : row.label}
              </text>
              <rect
                x={LABEL_WIDTH}
                y={y + 6}
                width={barWidth}
                height={ROW_HEIGHT - 12}
                className={
                  highlightFirst && index === 0 ? 'chart-bar chart-bar-highlight' : 'chart-bar'
                }
              />
              <text
                x={LABEL_WIDTH + barWidth + 6}
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
    </figure>
  );
}
