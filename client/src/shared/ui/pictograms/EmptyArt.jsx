// The 3 empty-state illustrations (DESIGN.md section 8): no reports, no matches,
// no notifications. Same family as the pictograms: 2px outlines, one frosted shape and
// one small detail, using the classes in pictogram.css. EmptyState in Layout.jsx
// shows one when its `illustration` prop is one of the names below.

// A blank ticket with dashed placeholder lines and a plus on the stub.
function NoReports() {
  return (
    <>
      <rect className="pg-fill" x="112" y="30" width="32" height="60" />
      <rect className="pg-line" x="16" y="30" width="128" height="60" />
      <path className="pg-perf" d="M112 30v60M46 48h48M46 60h36M46 72h24" />
      <circle className="pg-line" cx="30" cy="60" r="5" />
      <circle className="pg-dot" cx="128" cy="60" r="9" />
      <path className="pg-cut" d="M128 55v10M123 60h10" />
    </>
  );
}

// Two tickets that do not line up, with a magnifying glass between them.
function NoMatches() {
  return (
    <>
      {/* rotate(angle cx cy) tilts each ticket around its own centre. */}
      <g transform="rotate(-6 46 60)">
        <rect className="pg-line" x="14" y="40" width="64" height="40" />
        <circle className="pg-line" cx="24" cy="60" r="4" />
      </g>
      <g transform="rotate(6 114 60)">
        <rect className="pg-fill" x="82" y="40" width="64" height="40" />
        <circle className="pg-line" cx="92" cy="60" r="4" />
      </g>
      <circle className="pg-line pg-solid" cx="80" cy="56" r="14" />
      <path className="pg-line" d="M90 66l12 12" />
      <circle className="pg-dot" cx="80" cy="56" r="3" />
    </>
  );
}

// A quiet bell with an empty badge (a dash instead of a number).
function NoNotifications() {
  return (
    <>
      <path className="pg-fill" d="M58 78V56a22 22 0 0 1 44 0v22l8 8H50z" />
      <path className="pg-line" d="M72 92a8 8 0 0 0 16 0M80 26v8" />
      <circle className="pg-dot" cx="104" cy="38" r="10" />
      <path className="pg-cut" d="M99 38h10" />
    </>
  );
}

const ART = {
  'no-reports': { Shape: NoReports, label: 'No reports yet' },
  'no-matches': { Shape: NoMatches, label: 'No matches yet' },
  'no-notifications': { Shape: NoNotifications, label: 'No notifications' },
};

export const EMPTY_ART_NAMES = Object.keys(ART);

// Draw one illustration by name, or nothing if the name is unknown.
export function EmptyArt({ name }) {
  const art = ART[name];
  if (!art) {
    return null;
  }
  return (
    <svg className="pictogram empty-art" viewBox="0 0 160 120" role="img" aria-label={art.label}>
      <art.Shape />
    </svg>
  );
}
