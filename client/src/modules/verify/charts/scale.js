// The only chart maths we need, written by hand instead of using d3-scale:
// a linear scale turns a data value into a pixel position with one multiplication.
// Example: with max 20 and width 300, a value of 5 becomes 5 / 20 * 300 = 75 px.

// Return a function that maps 0..maxValue onto 0..maxPixels.
export function linearScale(maxValue, maxPixels) {
  // Avoid dividing by zero when every value is 0.
  const safeMax = maxValue > 0 ? maxValue : 1;
  return function toPixels(value) {
    return (value / safeMax) * maxPixels;
  };
}

// The largest `count` in a list of rows (0 for an empty list).
export function maxCount(rows) {
  return rows.reduce((largest, row) => Math.max(largest, row.count), 0);
}
