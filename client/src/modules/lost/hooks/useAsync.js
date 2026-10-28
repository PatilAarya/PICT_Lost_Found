// Loads data when a page opens: { data, error, reload }. data is null while loading.
// Pass a loader that does not change between renders (a function from api.js, or one
// wrapped in useCallback), so it loads once and again only when you call reload().
import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../../../shared/api/client.js';

export function useAsync(loader) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Run the loader and keep its result or its error message.
  const reload = useCallback(async () => {
    setError('');
    try {
      setData(await loader());
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [loader]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, reload };
}
