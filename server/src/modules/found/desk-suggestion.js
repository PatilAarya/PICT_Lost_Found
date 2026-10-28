// Ranks desks by how close they are to where an item was found.
import desksData from '../../shared/data/desks.json' with { type: 'json' };

const { desks } = desksData;

function deskScore(desk, buildingId, floorId) {
  if (desk.buildingId === buildingId && desk.floorId === floorId) return 4;
  if (desk.buildingId === buildingId) return 3;
  if (desk.nearBuildingIds.includes(buildingId)) return 2;
  if (desk.type === 'security_desk') return 1;
  return 0;
}

export function rankDesks({ buildingId, floorId }) {
  return [...desks].sort(
    (first, second) =>
      deskScore(second, buildingId, floorId) - deskScore(first, buildingId, floorId)
  );
}

export function suggestDesk({ buildingId, floorId }) {
  return rankDesks({ buildingId, floorId })[0] || null;
}

export function listDesks() {
  return desks;
}
