// Tests for readable place names: with the buildings list loaded, ids become real names;
// without it, the ids are still shown so a ticket is never blank.
// The API is replaced with a fake that returns a tiny locations.json.
import { describe, expect, it, vi } from 'vitest';

vi.mock('../api/client.js', () => ({
  api: {
    get: async () => ({
      data: {
        buildings: [
          {
            id: 'lab',
            name: 'Lab building',
            floors: [
              { id: 'g', label: 'Ground floor', areas: [{ id: 'canteen', name: 'Canteen' }] },
            ],
          },
        ],
      },
    }),
  },
}));

const { loadPlaces, placeName } = await import('./places.js');

describe('placeName', () => {
  it('falls back to the ids before the list is loaded', () => {
    expect(placeName({ buildingId: 'lab', floorId: 'g', areaId: 'canteen' })).toBe(
      'lab, floor g, canteen'
    );
    expect(placeName(null)).toBe('');
  });

  it('uses the real names once the list is loaded', async () => {
    await loadPlaces();
    expect(placeName({ buildingId: 'lab', floorId: 'g', areaId: 'canteen' })).toBe(
      'Lab building, Ground floor, Canteen'
    );
    expect(placeName({ buildingId: 'lab', floorId: 'g' })).toBe('Lab building, Ground floor');
  });
});
