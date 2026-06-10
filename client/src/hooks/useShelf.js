import { useState, useEffect, useCallback } from 'react';
import { getShelf, deleteBook as deleteBookApi } from '../services/bookService';

export function useShelf() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (sort) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShelf(sort);
      setBooks(data);
    } catch {
      setError('Could not load your shelf.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteBook = async (id) => {
    await deleteBookApi(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  return { books, loading, error, deleteBook, reload: load };
}
