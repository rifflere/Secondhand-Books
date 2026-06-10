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
      <h2 className="page-heading">Search Books</h2>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title…"
        />
        <button className="search-btn" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="search-error">{error}</p>}

      {results && !loading && (
        <p className="search-meta">
          {results.totalResults.toLocaleString()} results for "{results.searchTerm}"
        </p>
      )}

      <div className="search-results">
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
