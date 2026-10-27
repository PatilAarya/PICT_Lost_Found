// STUB of the claim-ticket card: PropertyTag { item, onClick, compact }.
// item: { kind: lost|found, serial, category, title, status, locationLabel, timeLabel, imageUrl }.
// Member 1 builds the full ticket (hole, perforation, stub) from DESIGN.md section 6.
import { Pictogram } from './Pictogram.jsx';
import { Stamp } from './Stamp.jsx';

export function PropertyTag({ item, onClick, compact = false }) {
  const Tag = onClick ? 'button' : 'article';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`ticket ticket-${item.kind} ${compact ? 'ticket-compact' : ''}`}
      onClick={onClick}
    >
      <div className="ticket-body">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} loading="lazy" width="48" height="48" />
        ) : (
          <Pictogram category={item.category} size={48} />
        )}
        <div>
          <strong>{item.title}</strong>
          <div className="ticket-meta">{item.locationLabel}</div>
          <div className="ticket-meta">{item.timeLabel}</div>
        </div>
      </div>
      {compact ? null : <Stamp status={item.status} />}
      <div className="ticket-stub tabular">{item.serial}</div>
    </Tag>
  );
}
