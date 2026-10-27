// A small hook that loads data when a page opens: { data, loading, error, reload }.
// Pass a function wrapped in useCallback, so it only reloads when its inputs change.
// Used by every verify page instead of repeating the same useState/useEffect code.
import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../../../shared/api/client.js';

export function useLoad(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Run the loader and store its result or its error message.
  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await loader());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
