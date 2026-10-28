// Tests for the floor plan tap maths.
import { describe, expect, it } from 'vitest';
import { areaFromTarget, pointToFraction } from './pinMaths.js';

const box = { left: 100, top: 50, width: 400, height: 200 };

describe('pointToFraction', () => {
  it('turns screen pixels into fractions of the box', () => {
    expect(pointToFraction(300, 150, box)).toEqual({ x: 0.5, y: 0.5 });
    expect(pointToFraction(200, 100, box)).toEqual({ x: 0.25, y: 0.25 });
  });

  it('keeps taps just outside the edge inside 0..1', () => {
    expect(pointToFraction(90, 260, box)).toEqual({ x: 0, y: 1 });
  });
});

describe('areaFromTarget', () => {
  it('finds the room around the tapped element, only for this floor', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML =
      '<g><rect class="area" id="canteen"></rect><rect class="area" id="other-floor"></rect></g>';
    const [canteen, otherFloor] = svg.querySelectorAll('rect');
    const areas = [{ id: 'canteen', name: 'Canteen' }];
    expect(areaFromTarget(canteen, areas)).toBe('canteen');
    expect(areaFromTarget(otherFloor, areas)).toBe('');
    expect(areaFromTarget(svg, areas)).toBe('');
  });
});
