import React, { useState } from 'react';
import BookCard from '../components/BookCard';
import { useSearch } from '../hooks/useSearch';
import { saveBook } from '../services/bookService';

export default function SearchPage() {
  const { query, setQuery, results, loading, error, search } = useSearch();
  const [saveStatuses, setSaveStatuses] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    search();
  };

  const handleSave = async (book) => {
    const key = book.olKey || book.title;
    setSaveStatuses((prev) => ({ ...prev, [key]: 'saving' }));
    try {
      await saveBook(book);
      setSaveStatuses((prev) => ({ ...prev, [key]: 'saved' }));
    } catch (err) {
      const serverError = err.response?.data?.error;
      const nextStatus = serverError === 'Book already on shelf' ? 'duplicate' : 'error';
      setSaveStatuses((prev) => ({ ...prev, [key]: nextStatus }));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title…"
          style={{
            flex: 1, padding: '8px 12px', fontSize: 15,
            borderRadius: 6, border: '1px solid #d1d5db', outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '8px 18px', fontSize: 15, borderRadius: 6,
            border: 'none', backgroundColor: '#2563eb', color: '#fff',
            cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}

      {results && !loading && (
        <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 14 }}>
          {results.totalResults.toLocaleString()} results for "{results.searchTerm}"
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results?.books.map((book, i) => {
          const key = book.olKey || book.title;
          return (
            <BookCard
              key={book.olKey || i}
              book={book}
              onSave={handleSave}
              saveStatus={saveStatuses[key]}
            />
          );
        })}
      </div>
    </div>
  );
}
