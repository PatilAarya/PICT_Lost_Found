// Tests for the found module's small pure helpers: when the Next button may be pressed,
// how items are counted for the number cards, and the preview ticket while posting.
// Run with `npm test -w client`.
import { describe, expect, it } from 'vitest';
import { canContinue } from './steps.js';
import { countByStage, ticketFromForm } from './ticket.js';

// An empty form, like the one useFoundItemForm starts with.
function emptyForm() {
  return {
    category: '',
    title: '',
    photos: [],
    hiddenDetails: [],
    location: null,
    custody: { type: 'desk', deskId: '' },
    foundAt: '2026-10-27T13:15',
  };
}

describe('canContinue', () => {
  it('needs a category, a photo, a title, two answers and a place', () => {
    const form = emptyForm();
    expect(canContinue(0, form)).toBe(false);
    expect(canContinue(0, { ...form, category: 'bottle' })).toBe(true);
    expect(canContinue(1, { ...form, photos: [{ id: 'a' }] })).toBe(true);
    expect(canContinue(3, { ...form, title: '   ' })).toBe(false);
    const oneAnswer = [{ answer: 'dent' }, { answer: ' ' }];
    expect(canContinue(4, { ...form, hiddenDetails: oneAnswer })).toBe(false);
    const twoAnswers = [{ answer: 'dent' }, { answer: 'sticker' }];
    expect(canContinue(4, { ...form, hiddenDetails: twoAnswers })).toBe(true);
    expect(canContinue(5, { ...form, location: { buildingId: 'main', floorId: 'g' } })).toBe(true);
  });

  it('needs a desk unless the finder keeps the item', () => {
    const form = emptyForm();
    expect(canContinue(6, form)).toBe(false);
    expect(canContinue(6, { ...form, custody: { type: 'finder' } })).toBe(true);
  });
});

describe('countByStage', () => {
  it('counts items waiting for the owner and items returned', () => {
    const items = [{ status: 'posted' }, { status: 'in_custody' }, { status: 'released' }];
    expect(countByStage(items)).toEqual({ total: 3, atDesk: 2, returned: 1 });
  });
});

describe('ticketFromForm', () => {
  it('fills sensible words before the finder has typed anything', () => {
    const ticket = ticketFromForm(emptyForm(), null);
    expect(ticket.title).toBe('Your found item');
    expect(ticket.category).toBe('other');
    expect(ticket.locationLabel).toBe('Place not chosen yet');
  });
});
