// client/src/modules/found/pages/MyFoundItemsPage.jsx
// Shows the logged-in user's own found-item posts as claim-ticket cards.
// Uses GET /found/items (server defaults to finderId = current user unless ?all=true).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, EmptyState, Spinner, PropertyTag, Button } from '../../../shared/ui/index.js';
import { api, errorMessage } from '../../../shared/api/client.js';

// Turn a server FoundItem doc into the plain shape PropertyTag expects.
function toTicketItem(doc) {
  return {
    kind: 'found',
    serial: doc.serial,
    category: doc.category,
    title: doc.title,
    status: doc.status,
    // Placeholder label: we only have ids here, not human names, until the
    // meta module's location list is wired in. Good enough to show progress.
    locationLabel: `${doc.location?.buildingId || ''} / ${doc.location?.floorId || ''}`,
    timeLabel: doc.foundAt ? new Date(doc.foundAt).toLocaleDateString() : '',
    imageUrl: doc.images?.[0]?.publicUrl || null,
  };
}

export default function MyFoundItemsPage() {
  const [items, setItems] = useState(null); // null = loading
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/found/items')
      .then((response) => {
        if (!cancelled) setItems(response.data.items || []);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="page">
      <PageHeader
        title="My found items"
        subtitle="Everything you've posted, and what's happening with it."
        actions={
          <Link to="/found/new">
            <Button>Post another</Button>
          </Link>
        }
      />

      {error ? <p className="form-error">{error}</p> : null}

      {items === null && !error ? <Spinner /> : null}

      {items && items.length === 0 ? (
        <EmptyState
          title="You haven't posted any found items yet."
          action={
            <Link to="/found/new">
              <Button>Post a found item</Button>
            </Link>
          }
        />
      ) : null}

      {items && items.length > 0 ? (
        <div className="my-found-items__list">
          {items.map((doc) => (
            <PropertyTag key={doc._id} item={toTicketItem(doc)} />
          ))}
        </div>
      ) : null}
    </section>
  );
}