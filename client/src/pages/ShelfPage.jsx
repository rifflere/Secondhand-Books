import React, { useState } from 'react';
import ShelfCard from '../components/ShelfCard';
import BookshelfGraphic from '../components/BookshelfGraphic';
import { useShelf } from '../hooks/useShelf';

const BOOKS_PER_ROW = 4;

const SORTS = [
  { value: 'date', label: 'Date Added' },
  { value: 'title', label: 'Title' },
];

const DEFAULT_DIR = { date: 'desc', title: 'asc' };

export default function ShelfPage() {
  const { books, loading, error, deleteBook, reload } = useShelf();
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteError, setDeleteError] = useState(null);

  const handleSort = (key) => {
    if (key === sortBy) {
      const newDir = sortDir === 'desc' ? 'asc' : 'desc';
      setSortDir(newDir);
      reload(key, newDir);
    } else {
      const newDir = DEFAULT_DIR[key];
      setSortBy(key);
      setSortDir(newDir);
      reload(key, newDir);
    }
  };

  const sortArrow = (key) => {
    if (key !== sortBy) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const handleDelete = async (id) => {
    setDeleteError(null);
    try {
      await deleteBook(id);
    } catch {
      setDeleteError('Failed to remove book. Please try again.');
    }
  };

  const shelves = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_ROW) {
    shelves.push(books.slice(i, i + BOOKS_PER_ROW));
  }

  return (
    <div>
      <BookshelfGraphic />

      <div className="shelf-toolbar">
        <h2 className="page-heading">My Shelf</h2>
        <div className="shelf-sort">
          {SORTS.map(({ value, label }) => (
            <button
              key={value}
              className={`sort-btn${sortBy === value ? ' sort-btn--active' : ''}`}
              onClick={() => handleSort(value)}
            >
              {label}{sortArrow(value)}
            </button>
          ))}
        </div>
      </div>

      {(error || deleteError) && (
        <p className="shelf-message">{error || deleteError}</p>
      )}
      {loading && <p className="shelf-loading">Loading your shelf…</p>}

      {!loading && books.length === 0 && !error && (
        <div className="shelf-empty">
          <p className="shelf-empty-title">Your shelf is empty.</p>
          <p className="shelf-empty-sub">Search for books and save them here.</p>
        </div>
      )}

      {shelves.map((rowBooks, rowIndex) => (
        <div key={rowIndex} className="shelf-row">
          <div className="shelf-grid">
            {rowBooks.map((book) => (
              <ShelfCard key={book.id} book={book} onDelete={handleDelete} />
            ))}
            {rowBooks.length < BOOKS_PER_ROW &&
              Array.from({ length: BOOKS_PER_ROW - rowBooks.length }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
          </div>
          <div className="shelf-plank" />
        </div>
      ))}
    </div>
  );
}
