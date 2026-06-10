import React, { useState } from 'react';
import BookCard from '../components/BookCard';
import { useSearch } from '../hooks/useSearch';
import { saveBook } from '../services/bookService';

const C = {
  text: '#2C1205',
  muted: '#7D5540',
  border: '#D4B080',
  primary: '#8B1C1C',
  input: '#FFF8EE',
  error: '#8B1C1C',
};

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
      <h2 style={{ margin: '0 0 20px', fontSize: 22, color: C.text, fontFamily: 'Georgia, serif' }}>
        Search Books
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title…"
          style={{
            flex: 1, padding: '9px 14px', fontSize: 15,
            borderRadius: 6, border: `1px solid ${C.border}`,
            backgroundColor: C.input, color: C.text,
            fontFamily: 'Georgia, serif', outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '9px 20px', fontSize: 15, borderRadius: 6,
            border: 'none', fontFamily: 'Georgia, serif',
            backgroundColor: loading ? '#C4766B' : C.primary,
            color: '#FFF8EE', cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <p style={{ color: C.error, fontStyle: 'italic', fontSize: 14, marginBottom: 16 }}>{error}</p>
      )}

      {results && !loading && (
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 16, fontStyle: 'italic' }}>
          {results.totalResults.toLocaleString()} results for "{results.searchTerm}"
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
