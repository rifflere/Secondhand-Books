import { useState } from 'react';
import { searchBooks } from '../services/bookService';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (overrideQuery) => {
    const q = (overrideQuery ?? query).trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchBooks(q);
      setResults(data);
    } catch {
      setError('Search failed. Is the backend running?');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return { query, setQuery, results, loading, error, search };
}
