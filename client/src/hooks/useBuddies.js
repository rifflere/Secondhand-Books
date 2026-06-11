import { useState, useEffect, useCallback } from 'react';
import * as buddiesApi from '../services/buddiesService';

export function useBuddies(userId) {
  const [buddies, setBuddies] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setBuddies([]);
      setIncoming([]);
      return;
    }
    setLoading(true);
    try {
      const [b, i] = await Promise.all([
        buddiesApi.listBuddies(),
        buddiesApi.listIncoming(),
      ]);
      setBuddies(b);
      setIncoming(i);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { buddies, incoming, loading, reload: load };
}
