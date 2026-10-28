// Picks a place on campus, then a floor, then a room.
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ChipSelect } from '../ui/index.js';
import { FloorPlan } from './FloorPlan.jsx';
import './locationPicker.css';

const CAMPUS_PLAN = '/floorplans/campus.svg';

function findById(list, id) {
  return (list || []).find((entry) => entry.id === id) || null;
}

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

  function chooseBuilding(buildingId) {
    onChange({ buildingId });
  }
  function chooseFromMap({ areaId }) {
    if (areaId && areaId !== current.buildingId) chooseBuilding(areaId);
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
        <p className="picker-label">Tap the place on the campus map</p>
        <FloorPlan
          floor={{ plan: CAMPUS_PLAN, areas: buildings }}
          value={{ areaId: current.buildingId }}
          mode="area"
          onPick={chooseFromMap}
        />
        <p className="picker-label">Or choose the place</p>
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
