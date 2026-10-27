// STUB location picker: LocationPicker { value, onChange, mode }.
// Three cascading dropdowns (building, then floor, then area) loaded from
// GET /api/meta/locations. value is a Location { buildingId, floorId, areaId, x, y }.
// Member 1 replaces it with the tap-the-floor-plan picker; the props stay the same.
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Find an item by id in a list, or return null.
function findById(list, id) {
  return (list || []).find((entry) => entry.id === id) || null;
}

export function LocationPicker({ value, onChange, mode: _mode = 'area' }) {
  const [buildings, setBuildings] = useState([]);
  const current = value || {};

  useEffect(() => {
    api.get('/meta/locations').then((res) => setBuildings(res.data.buildings));
  }, []);

  const building = findById(buildings, current.buildingId);
  const floor = building ? findById(building.floors, current.floorId) : null;

  return (
    <fieldset className="location-picker">
      <legend>Where</legend>
      <select
        className="input"
        aria-label="Building"
        value={current.buildingId || ''}
        onChange={(event) => onChange({ buildingId: event.target.value })}
      >
        <option value="">Choose a building</option>
        {buildings.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        ))}
      </select>
      <select
        className="input"
        aria-label="Floor"
        disabled={!building}
        value={current.floorId || ''}
        onChange={(event) =>
          onChange({ buildingId: current.buildingId, floorId: event.target.value })
        }
      >
        <option value="">Choose a floor</option>
        {(building ? building.floors : []).map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.label}
          </option>
        ))}
      </select>
      <select
        className="input"
        aria-label="Area"
        disabled={!floor}
        value={current.areaId || ''}
        onChange={(event) => onChange({ ...current, areaId: event.target.value })}
      >
        <option value="">Choose an area</option>
        {(floor ? floor.areas : []).map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        ))}
      </select>
    </fieldset>
  );
}
