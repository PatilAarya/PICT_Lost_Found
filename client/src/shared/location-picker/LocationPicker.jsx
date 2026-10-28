// LocationPicker { value, onChange, mode } (contract section G). value is a Location
// { buildingId, floorId, areaId, x, y }. Choose a building, then a floor, then tap the
// floor plan: mode "pin" also records the exact spot (x, y from 0 to 1), mode "area"
// only the room. Rooms are also listed as buttons under the plan, for keyboards and for
// floors that have no plan yet. Buildings come from GET /api/meta/locations.
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ChipSelect } from '../ui/index.js';
import { FloorPlan } from './FloorPlan.jsx';
import './locationPicker.css';

// Find an item by id in a list, or return null.
function findById(list, id) {
  return (list || []).find((entry) => entry.id === id) || null;
}

// Turn a list of { id, name or label } into ChipSelect options.
function toOptions(list, labelKey) {
  return list.map((entry) => ({ value: entry.id, label: entry[labelKey] }));
}

export function LocationPicker({ value, onChange, mode = 'area' }) {
  const [buildings, setBuildings] = useState([]);
  const current = value || {};

  useEffect(() => {
    api
      .get('/meta/locations')
      .then((res) => setBuildings(res.data.buildings))
      .catch(() => setBuildings([]));
  }, []);

  const building = findById(buildings, current.buildingId);
  const floor = building ? findById(building.floors, current.floorId) : null;

  // A new building or floor starts a fresh choice; a room or pin keeps both.
  function chooseBuilding(buildingId) {
    onChange({ buildingId });
  }
  function chooseFloor(floorId) {
    onChange({ buildingId: current.buildingId, floorId });
  }
  function choosePlace(place) {
    onChange({ buildingId: current.buildingId, floorId: current.floorId, ...place });
  }

  return (
    <div className="location-picker">
      <div className="picker-row">
        <p className="picker-label">Building</p>
        <ChipSelect
          options={toOptions(buildings, 'name')}
          value={current.buildingId}
          onChange={chooseBuilding}
        />
      </div>
      {building ? (
        <div className="picker-row">
          <p className="picker-label">Floor</p>
          <ChipSelect
            options={toOptions(building.floors, 'label')}
            value={current.floorId}
            onChange={chooseFloor}
          />
        </div>
      ) : null}
      {floor ? (
        <div className="picker-row">
          <p className="picker-label">
            {mode === 'pin' ? 'Tap the spot on the plan' : 'Tap the room on the plan'}
          </p>
          <FloorPlan floor={floor} value={current} mode={mode} onPick={choosePlace} />
          <p className="picker-label">Or choose the room</p>
          <ChipSelect
            options={toOptions(floor.areas, 'name')}
            value={current.areaId}
            onChange={(areaId) => choosePlace({ areaId, x: current.x, y: current.y })}
          />
        </div>
      ) : null}
    </div>
  );
}
