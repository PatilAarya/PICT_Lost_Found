// Hook that loads the found items posted by the logged-in user.
import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../../shared/api/client.js';

export function useMyFoundItems() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
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
