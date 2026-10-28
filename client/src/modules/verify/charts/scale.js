// Turns a data value into a pixel position for the charts.
export function linearScale(maxValue, maxPixels) {
  const safeMax = maxValue > 0 ? maxValue : 1;
  return function toPixels(value) {
    return (value / safeMax) * maxPixels;
  };
}

export function maxCount(rows) {
  return rows.reduce((largest, row) => Math.max(largest, row.count), 0);
}
