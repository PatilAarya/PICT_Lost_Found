// Loads the logged-in person's own found items from GET /api/found/items
// (the server returns only your items unless a handler asks for ?all=true).
// Returns { items, error }: items is null while loading, then an array.
import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../../shared/api/client.js';

export function useMyFoundItems() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // If the page closes before the answer arrives, ignore the answer.
    let cancelled = false;
    api
      .get('/found/items', { params: { limit: 50 } })
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

  return { items, error };
}
