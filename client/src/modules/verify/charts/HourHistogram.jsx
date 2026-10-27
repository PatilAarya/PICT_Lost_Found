// A histogram of items found per hour of the day (0 to 23), in plain SVG.
// Each column's height comes from linearScale(); SVG's y axis points down, so a
// column of height h starts at y = chartHeight - h. The busiest hour is in --berry.
import { linearScale, maxCount } from './scale.js';

const COLUMN = 16;
const GAP = 4;
const CHART_HEIGHT = 120;
const AXIS = 20;

export function HourHistogram({ hours }) {
  const toHeight = linearScale(maxCount(hours), CHART_HEIGHT);
  const busiest = maxCount(hours);
  const width = hours.length * (COLUMN + GAP);

  return (
    <figure className="chart">
      <figcaption>Items found by hour of day</figcaption>
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT + AXIS}`}
        role="img"
        aria-label="Items found per hour of the day"
      >
        <line x1="0" y1={CHART_HEIGHT} x2={width} y2={CHART_HEIGHT} className="chart-grid" />
        {hours.map((slot) => {
          const columnHeight = toHeight(slot.count);
          const x = slot.hour * (COLUMN + GAP);
          const isBusiest = busiest > 0 && slot.count === busiest;
          return (
            <g key={slot.hour}>
              <rect
                x={x}
                y={CHART_HEIGHT - columnHeight}
                width={COLUMN}
                height={columnHeight}
                className={isBusiest ? 'chart-bar chart-bar-highlight' : 'chart-bar'}
              >
                <title>{`${slot.hour}:00 - ${slot.count} items`}</title>
              </rect>
              {slot.hour % 3 === 0 ? (
                <text
                  x={x + COLUMN / 2}
                  y={CHART_HEIGHT + 15}
                  className="chart-label"
                  textAnchor="middle"
                >
                  {slot.hour}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
