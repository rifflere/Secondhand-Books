import { useState, useEffect, useCallback } from 'react';
import * as shelvesApi from '../services/shelvesService';

export function useShelves() {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setShelves(await shelvesApi.listShelves());
    } catch {
      setError('Could not load shelves.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createShelf = async (name) => {
    const shelf = await shelvesApi.createShelf(name);
    setShelves((prev) => [...prev, shelf]);
    return shelf;
  };

  const updateShelf = async (id, updates) => {
    await shelvesApi.updateShelf(id, updates);
    setShelves((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteShelf = async (id) => {
    await shelvesApi.deleteShelf(id);
    setShelves((prev) => prev.filter((s) => s.id !== id));
  };

  return { shelves, loading, error, createShelf, updateShelf, deleteShelf, reload: load };
}
