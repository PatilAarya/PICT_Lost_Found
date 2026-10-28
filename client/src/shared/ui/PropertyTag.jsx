// The claim ticket card used for lost and found items.
import { Pictogram } from './Pictogram.jsx';
import { Stamp, inkFor, stampWord } from './Stamp.jsx';
import { barcodeBars, splitSerial } from './ticketParts.js';
import './ticket.css';
import './ticket-compact.css';

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

function FullLines({ item }) {
  return (
    <>
      {item.locationLabel ? <span className="ticket-meta">{item.locationLabel}</span> : null}
      {item.timeLabel ? <span className="ticket-meta tabular">{item.timeLabel}</span> : null}
    </>
  );
}

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

const FINISHED = ['recovered', 'released', 'closed', 'donated'];

export function PropertyTag({ item, onClick, compact = false }) {
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
