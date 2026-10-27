// Picks the best desk to suggest to a finder, based on where the item
// was found. Reads the static list in shared/data/desks.json and tries
// the most specific match first, falling back to a more general one.
import desksData from '../../shared/data/desks.json' with { type: 'json' };

const { desks } = desksData;

// Returns the single best desk for a location, or null if the desk list
// is somehow empty (should not happen, but callers should not crash).
export function suggestDesk({ buildingId, floorId }) {
  const sameBuildingAndFloor = desks.find(
    (desk) => desk.buildingId === buildingId && desk.floorId === floorId
  );
  if (sameBuildingAndFloor) return sameBuildingAndFloor;

  const sameBuilding = desks.find((desk) => desk.buildingId === buildingId);
  if (sameBuilding) return sameBuilding;

  const nearby = desks.find((desk) => desk.nearBuildingIds.includes(buildingId));
  if (nearby) return nearby;

  const anySecurityDesk = desks.find((desk) => desk.type === 'security_desk');
  return anySecurityDesk || null;
}

// Returns every desk, used by a "choose a different desk" screen so the
// finder is not forced to accept the automatic suggestion.
export function listDesks() {
  return desks;
}