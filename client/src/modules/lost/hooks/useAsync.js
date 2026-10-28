// Hook that loads data when a page opens.
import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../../../shared/api/client.js';

export function useAsync(loader) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

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
