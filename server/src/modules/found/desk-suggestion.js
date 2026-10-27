// Picks the best desks to suggest to a finder, based on where the item
// was found. Reads the static list in shared/data/desks.json and ranks
// every desk: same building and floor, then same building, then desks that
// list the building as nearby, then the rest. routes.js returns the top 3.
import desksData from '../../shared/data/desks.json' with { type: 'json' };

const { desks } = desksData;

// A score for one desk: a higher number means a better suggestion.
function deskScore(desk, buildingId, floorId) {
  if (desk.buildingId === buildingId && desk.floorId === floorId) return 4;
  if (desk.buildingId === buildingId) return 3;
  if (desk.nearBuildingIds.includes(buildingId)) return 2;
  // Any security desk is a sensible last resort, it is open the longest.
  if (desk.type === 'security_desk') return 1;
  return 0;
}

// Every desk, best first. sort() keeps the file order for desks with the same score.
export function rankDesks({ buildingId, floorId }) {
  return [...desks].sort(
    (first, second) =>
      deskScore(second, buildingId, floorId) - deskScore(first, buildingId, floorId)
  );
}

// The single best desk for a location, or null if the desk list is empty.
export function suggestDesk({ buildingId, floorId }) {
  return rankDesks({ buildingId, floorId })[0] || null;
}

// Returns every desk, used by a "choose a different desk" screen so the
// finder is not forced to accept the automatic suggestion.
export function listDesks() {
  return desks;
}
