// STUB category pictogram: Pictogram { category, size }.
// For now every category draws the same simple tag shape with its name for screen
// readers. Member 1 replaces this with the 10 custom SVGs from DESIGN.md section 8.

export function Pictogram({ category, size = 48 }) {
  const label = String(category || 'other').replaceAll('_', ' ');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={label}
      className="pictogram"
    >
      <rect
        x="6"
        y="10"
        width="36"
        height="28"
        rx="2"
        fill="var(--frost)"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="14" cy="24" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
