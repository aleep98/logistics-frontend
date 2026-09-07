import { useEffect, useState } from 'react';
import { fetchCollection } from '../api/collections';
import { useDataSync } from './useDataSync';
export function useCollection<T>(path: string | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const syncKey = useDataSync(state => state.syncKey);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!path) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setError(false);
    fetchCollection<T>(path, controller.signal).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, syncKey, attempt]);
  return { data, loading, error, retry: () => setAttempt(value => value + 1) };
}
