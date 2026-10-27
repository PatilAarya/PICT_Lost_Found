// Tests for the verify client helpers: the chart scale maths, the countdown text,
// and that a bar chart draws one bar per row with its number as a direct label.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { linearScale, maxCount } from './charts/scale.js';
import { BarChart } from './charts/BarChart.jsx';
import { formatCountdown, percent } from './format.js';

afterEach(cleanup);

describe('chart scale', () => {
  it('maps values onto pixels in proportion', () => {
    const toPixels = linearScale(20, 300);
    expect(toPixels(5)).toBe(75);
    expect(toPixels(20)).toBe(300);
    expect(linearScale(0, 300)(0)).toBe(0);
    expect(maxCount([{ count: 3 }, { count: 9 }])).toBe(9);
  });
});

describe('formatting', () => {
  it('writes countdowns and percentages', () => {
    expect(formatCountdown(125000)).toBe('2:05');
    expect(formatCountdown(65 * 60 * 1000)).toBe('1 h 05 min');
    expect(percent(0.857)).toBe('86%');
  });
});

describe('BarChart', () => {
  it('draws one bar per row with direct labels', () => {
    const rows = [
      { label: 'Main building', count: 12 },
      { label: 'Lab building', count: 4 },
    ];
    const { container, getByText } = render(<BarChart title="By building" rows={rows} />);
    expect(container.querySelectorAll('rect')).toHaveLength(2);
    expect(getByText('12')).toBeTruthy();
    expect(getByText('Lab building')).toBeTruthy();
  });
});
