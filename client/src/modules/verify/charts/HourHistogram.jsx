// A histogram of items found per hour of the day (0 to 23), in plain SVG.
// Each column's height comes from linearScale(); SVG's y axis points down, so a
// column of height h starts at y = chartHeight - h. The busiest hour is in --berry.
// Every third hour is labelled in words ("9 am") so the axis is easy to read.
import { linearScale, maxCount } from './scale.js';

const COLUMN = 18;
const GAP = 6;
const CHART_HEIGHT = 140;
const AXIS = 24;

// 0 becomes "12 am", 13 becomes "1 pm", 12 becomes "noon".
export function hourLabel(hour) {
  if (hour === 0) return '12 am';
  if (hour === 12) return 'noon';
  return hour < 12 ? `${hour} am` : `${hour - 12} pm`;
}

export function HourHistogram({ hours }) {
  const toHeight = linearScale(maxCount(hours), CHART_HEIGHT);
  const busiest = maxCount(hours);
  const width = hours.length * (COLUMN + GAP);

  return (
    <svg
      className="chart"
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
              rx="3"
              className={isBusiest ? 'chart-bar chart-bar-highlight' : 'chart-bar'}
            >
              <title>{`${hourLabel(slot.hour)}: ${slot.count} items`}</title>
            </rect>
            {slot.hour % 3 === 0 ? (
              <text
                x={x + COLUMN / 2}
                y={CHART_HEIGHT + 17}
                className="chart-label"
                textAnchor="middle"
              >
                {hourLabel(slot.hour)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
