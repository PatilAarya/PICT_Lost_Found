// Turns location ids into readable place names.
import { api } from '../api/client.js';

let buildings = [];

export async function loadPlaces() {
  try {
    const res = await api.get('/meta/locations');
    buildings = res.data.buildings;
  } catch {
    buildings = [];
  }
}

function findById(list, id) {
  return (list || []).find((entry) => entry.id === id) || null;
}

export function placeName(location) {
  if (!location || !location.buildingId) return '';
  const building = findById(buildings, location.buildingId);
  const floor = building ? findById(building.floors, location.floorId) : null;
  const area = floor ? findById(floor.areas, location.areaId) : null;
  const parts = [
    building ? building.name : location.buildingId,
    floor ? floor.label : location.floorId && `floor ${location.floorId}`,
    area ? area.name : location.areaId,
  ];
  return parts.filter(Boolean).join(', ').replaceAll('-', ' ');
}
