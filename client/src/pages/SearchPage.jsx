import React, { useEffect, useState } from 'react';
import BookCard from '../components/BookCard';
import { searchBooks } from '../services/bookService';

export default function SearchPage() {
  const [query, setQuery] = useState('War and Peace');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSearch = async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchBooks(searchTerm);
      setResults(data);
    } catch (err) {
      setError('Search failed. Is the backend running on port 3001?');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch('War and Peace');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) runSearch(query.trim());
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ marginBottom: 24 }}>Secondhand Books</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title..."
          style={{ flex: 1, padding: '8px 12px', fontSize: 15, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '8px 18px', fontSize: 15, borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer' }}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>
      )}

      {results && !loading && (
        <p style={{ color: '#666', marginBottom: 16 }}>
          {results.totalResults.toLocaleString()} results for "{results.searchTerm}" — showing top {results.books.length}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results?.books.map((book, i) => (
          <BookCard key={i} book={book} />
        ))}
      </div>
    </div>
  );
}
