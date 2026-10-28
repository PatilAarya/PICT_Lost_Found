// Tests for the design system: the serial and barcode helpers, stamp words and inks
// for every status in the contract, all 10 pictograms, and the PropertyTag anatomy.
// Run with `npm test -w client` (Vitest with jsdom, a fake browser).
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { CATEGORIES, CLAIM_STATUS, FOUND_STATUS, LOST_STATUS } from '../constants.js';
import { barcodeBars, splitSerial } from './ticketParts.js';
import { inkFor, stampWord } from './Stamp.jsx';
import { EmptyState, Pictogram, PropertyTag } from './index.js';

afterEach(cleanup);

describe('ticket helpers', () => {
  it('splits a serial into prefix, letter and number', () => {
    expect(splitSerial('PICT-L-000045', 'lost')).toEqual({
      prefix: 'PICT',
      letter: 'L',
      number: '000045',
    });
  });

  it('falls back to the kind when the serial is missing', () => {
    expect(splitSerial(undefined, 'found').letter).toBe('F');
  });

  it('makes one bar per digit with widths 1 to 3', () => {
    const { bars } = barcodeBars('000123');
    expect(bars).toHaveLength(6);
    expect(bars.map((bar) => bar.width)).toEqual([1, 1, 1, 2, 3, 1]);
  });
});

describe('stamps', () => {
  const allStatuses = [...FOUND_STATUS, ...LOST_STATUS, ...CLAIM_STATUS];

  it('have real words for every contract status', () => {
    for (const status of allStatuses) {
      expect(stampWord(status)).not.toContain('_');
    }
    expect(stampWord('transferred_admin')).toBe('Moved to admin office');
  });

  it('use red for attention, steel for in progress and dark for finished', () => {
    expect(inkFor('matched')).toBe('lost');
    expect(inkFor('posted')).toBe('found');
    expect(inkFor('released')).toBe('done');
  });
});

describe('pictograms', () => {
  it('draw every category with a readable label', () => {
    for (const category of CATEGORIES) {
      const { getByRole, unmount } = render(<Pictogram category={category} />);
      expect(getByRole('img').getAttribute('aria-label')).toBe(category.replace('_', ' '));
      unmount();
    }
  });

  it('fall back to "other" for an unknown category', () => {
    const { getByRole } = render(<Pictogram category="umbrella" />);
    expect(getByRole('img').getAttribute('aria-label')).toBe('other');
  });
});

describe('PropertyTag', () => {
  const item = {
    kind: 'found',
    serial: 'PICT-F-000123',
    category: 'phone',
    title: 'Black phone',
    status: 'in_custody',
    locationLabel: 'Building B, canteen',
    timeLabel: 'Found 27 Oct, 13:15',
  };

  it('shows the kind in words, the stamp and the stub number', () => {
    const { container, getByText } = render(<PropertyTag item={item} />);
    expect(getByText('Found item')).toBeTruthy();
    expect(getByText('In custody').className).toContain('stamp');
    expect(container.querySelector('.stub-number').textContent).toBe('000123');
  });

  it('is a button only when clickable, and compact drops the big stamp', () => {
    const { container } = render(<PropertyTag item={item} compact onClick={() => {}} />);
    expect(container.querySelector('button.ticket-compact')).toBeTruthy();
    expect(container.querySelector('.stamp')).toBeNull();
    expect(container.querySelector('.stamp-word').textContent).toBe('In custody');
  });
});

describe('EmptyState', () => {
  it('draws built-in art from a name', () => {
    const { getByRole } = render(<EmptyState title="Nothing yet" illustration="no-matches" />);
    expect(getByRole('img').getAttribute('aria-label')).toBe('No matches yet');
  });
});
