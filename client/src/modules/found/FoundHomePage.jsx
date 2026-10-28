// Found page: your posted items, counts and a short guide.
import { useNavigate } from 'react-router-dom';
import {
  Button,
  EmptyState,
  PageHeader,
  PropertyTag,
  Spinner,
  StatCard,
} from '../../shared/ui/index.js';
import { useMyFoundItems } from './hooks/useMyFoundItems.js';
import { countByStage, ticketFromItem } from './utils/ticket.js';
import './found.css';

const GUIDE = [
  'Take 2 to 4 photos: front, back and any mark.',
  'Blur anything private, like a phone screen or an ID number.',
  'Answer two secret questions only the owner could answer.',
  'Drop it at the suggested desk, or keep it and arrange a meetup.',
];

export function FoundHomePage() {
  const navigate = useNavigate();
  const { items, error } = useMyFoundItems();
  const counts = items ? countByStage(items) : { total: '-', atDesk: '-', returned: '-' };

  return (
    <section className="page">
      <PageHeader
        title="Found items"
        subtitle="Found something on campus? Post it so the owner can get it back."
        actions={
          <Button icon="plus" size="lg" onClick={() => navigate('/found/new')}>
            Post found item
          </Button>
        }
      />
      <div className="stat-grid">
        <StatCard icon="package" label="Posted by you" value={counts.total} />
        <StatCard icon="inbox" label="Waiting for the owner" value={counts.atDesk} />
        <StatCard icon="check-circle" label="Returned to owner" value={counts.returned} />
      </div>
      <div className="found-layout">
        <div className="card">
          <h2 className="card-title">Your found items</h2>
          <p className="card-subtitle">Newest first. The stamp shows where each item is now.</p>
          {error ? <p className="field-error">{error}</p> : null}
          {!items && !error ? <Spinner /> : null}
          {items && items.length === 0 ? (
            <EmptyState
              illustration="no-reports"
              title="Nothing posted yet. When you find something, use Post found item at the top."
            />
          ) : null}
          {items && items.length > 0 ? (
            <div className="ticket-stack">
              {items.map((doc) => (
                <PropertyTag key={doc._id} item={ticketFromItem(doc)} />
              ))}
            </div>
          ) : null}
        </div>
        <aside className="card">
          <h2 className="card-title">How posting works</h2>
          <p className="card-subtitle">About two minutes, on your phone or laptop.</p>
          <ol className="guide-list">
            {GUIDE.map((line, index) => (
              <li key={line}>
                <span className="guide-number tabular">{index + 1}</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
