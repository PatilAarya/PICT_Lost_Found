// The claim-ticket card, the signature component (DESIGN.md section 6):
// PropertyTag { item, onClick, compact }, where item is
// { kind: lost|found, serial, category, title, status, locationLabel, timeLabel, imageUrl }.
// Anatomy: punched hole, photo or pictogram, text, rubber stamp, and a tear-off stub
// with the serial number and barcode behind a perforated edge. Styles in ticket.css.
import { Pictogram } from './Pictogram.jsx';
import { Stamp, inkFor, stampWord } from './Stamp.jsx';
import { barcodeBars, splitSerial } from './ticketParts.js';
import './ticket.css';
import './ticket-compact.css';

// The photo when there is one, otherwise the category pictogram.
function TicketMedia({ item, size }) {
  if (item.imageUrl) {
    return (
      <img
        className="ticket-photo"
        src={item.imageUrl}
        alt={`Photo of ${item.title}`}
        width={size}
        height={size}
        loading="lazy"
      />
    );
  }
  return <Pictogram category={item.category} size={size} />;
}

// The barcode drawn as SVG rectangles, one per digit of the serial.
function Barcode({ number }) {
  const { bars, totalWidth } = barcodeBars(number);
  return (
    <svg className="stub-barcode" viewBox={`0 0 ${totalWidth} 10`} aria-hidden="true">
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y="0" width={bar.width} height="10" />
      ))}
    </svg>
  );
}

// Full ticket: place and time on their own lines.
function FullLines({ item }) {
  return (
    <>
      {item.locationLabel ? <span className="ticket-meta">{item.locationLabel}</span> : null}
      {item.timeLabel ? <span className="ticket-meta tabular">{item.timeLabel}</span> : null}
    </>
  );
}

// Compact ticket: one line with the status word, then the place, so it fits in 72px.
function CompactLine({ item }) {
  return (
    <span className="ticket-meta compact-line">
      {item.status ? (
        <span className={`stamp-word stamp-${inkFor(item.status)}`}>{stampWord(item.status)}</span>
      ) : null}
      {item.locationLabel ? <span className="compact-place">{item.locationLabel}</span> : null}
    </span>
  );
}

// The tear-off stub on the right: PICT, L or F, the number and the barcode.
function TicketStub({ item, compact }) {
  const { prefix, letter, number } = splitSerial(item.serial, item.kind);
  return (
    <span className="ticket-stub">
      {compact ? null : <span className="stub-brand">{prefix}</span>}
      <span className="stub-letter">{letter}</span>
      <span className="stub-number tabular">{number}</span>
      {compact ? null : <Barcode number={number} />}
    </span>
  );
}

// Statuses that mean the story is over: the item is back with its owner, or nobody needs it.
// These tickets get a dark "finished" edge instead of red or steel (DESIGN.md section 2).
const FINISHED = ['recovered', 'released', 'closed', 'donated'];

export function PropertyTag({ item, onClick, compact = false }) {
  // A clickable ticket is a real <button> so it works with the keyboard; otherwise <article>.
  const Tag = onClick ? 'button' : 'article';
  const classes = ['ticket', `ticket-${item.kind}`];
  if (FINISHED.includes(item.status)) classes.push('ticket-finished');
  if (compact) classes.push('ticket-compact');
  if (onClick) classes.push('ticket-clickable');

  return (
    <Tag type={onClick ? 'button' : undefined} className={classes.join(' ')} onClick={onClick}>
      <span className="ticket-main">
        <span className="ticket-hole" aria-hidden="true" />
        <span className="ticket-media">
          <TicketMedia item={item} size={compact ? 40 : 56} />
        </span>
        <span className="ticket-text">
          {/* Said first by screen readers, so the kind never depends on the edge colour. */}
          <span className="visually-hidden">
            {item.kind === 'found' ? 'Found item' : 'Lost item'}
          </span>
          <strong className="ticket-title">{item.title}</strong>
          {compact ? <CompactLine item={item} /> : <FullLines item={item} />}
        </span>
        {!compact && item.status ? (
          <span className="ticket-stamp">
            <Stamp status={item.status} />
          </span>
        ) : null}
      </span>
      <TicketStub item={item} compact={compact} />
    </Tag>
  );
}
