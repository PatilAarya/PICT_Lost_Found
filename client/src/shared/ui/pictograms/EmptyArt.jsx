// Illustrations for empty pages.
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

function NoMatches() {
  return (
    <>
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
