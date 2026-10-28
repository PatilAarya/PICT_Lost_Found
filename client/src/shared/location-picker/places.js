// Readable place names for any Location { buildingId, floorId, areaId }.
// "lab, floor g, canteen" becomes "Lab building, Ground floor, Canteen", using the names in
// server/src/shared/data/locations.json (GET /api/meta/locations). The list is loaded once
// when the app opens (AppShell.jsx calls loadPlaces) and kept in this file's variable, so
// placeName() can answer straight away, anywhere, without a hook or a network call.
import { api } from '../api/client.js';

let buildings = [];

// Download the buildings list once. Safe to call again; it just refreshes the list.
export async function loadPlaces() {
  try {
    const res = await api.get('/meta/locations');
    buildings = res.data.buildings;
  } catch {
    // Without the list we fall back to the ids, which still say roughly where.
    buildings = [];
  }
}

// Find an item by id in a list, or return null.
function findById(list, id) {
  return (list || []).find((entry) => entry.id === id) || null;
}

// "Lab building, Ground floor, Canteen" for a Location, or '' when there is none.
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
