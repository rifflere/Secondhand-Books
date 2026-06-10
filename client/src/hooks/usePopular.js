import { useState, useEffect } from 'react';
import { getPopularBooks } from '../services/bookService';

export function usePopular() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopularBooks()
      .then(setBooks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { books, loading };
}
