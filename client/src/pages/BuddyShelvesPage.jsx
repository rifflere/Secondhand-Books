import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookshelfGraphic from '../components/BookshelfGraphic';
import * as buddiesApi from '../services/buddiesService';

const BOOKS_PER_ROW = 4;
const SORTS = [
  { value: 'date', label: 'Date Added' },
  { value: 'title', label: 'Title' },
];
const DEFAULT_DIR = { date: 'desc', title: 'asc' };

function ReadOnlyShelfCard({ book }) {
  return (
    <div className={`shelf-card shelf-card--spine-${book.id % 5}`}>
      <div className="shelf-card-cover">
        {book.cover ? (
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="shelf-card-no-cover">No cover</div>
        )}
      </div>
      <div className="shelf-card-info">
        <h3 className="shelf-card-title">{book.title ?? 'Unknown Title'}</h3>
        <p className="shelf-card-author">{book.author ?? 'Unknown Author'}</p>
        <p className="shelf-card-meta">
          {book.year && <span>{book.year}</span>}
          {book.year && book.pages && <span> · </span>}
          {book.pages && <span>{book.pages}p</span>}
        </p>
      </div>
    </div>
  );
}

export default function BuddyShelvesPage() {
  const { username } = useParams();
  const [shelves, setShelves] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [books, setBooks] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    buddiesApi.getUserShelves(username)
      .then((data) => {
        setShelves(data);
        if (data.length > 0) {
          const main = data.find((s) => s.isDefault) || data[0];
          setActiveId(main.id);
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.error || 'Could not load shelves.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [username]);

  const loadBooks = useCallback(async (shelfId, sort, dir) => {
    if (!shelfId) return;
    setBooksLoading(true);
    try {
      setBooks(await buddiesApi.getUserShelfBooks(username, shelfId, sort, dir));
    } catch {
      setBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (activeId) loadBooks(activeId, sortBy, sortDir);
  }, [activeId, loadBooks, sortBy, sortDir]);

  const handleSort = (key) => {
    if (key === sortBy) {
      const newDir = sortDir === 'desc' ? 'asc' : 'desc';
      setSortDir(newDir);
      loadBooks(activeId, key, newDir);
    } else {
      const newDir = DEFAULT_DIR[key];
      setSortBy(key);
      setSortDir(newDir);
      loadBooks(activeId, key, newDir);
    }
  };

  const sortArrow = (key) => (key === sortBy ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '');

  const rows = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_ROW) {
    rows.push(books.slice(i, i + BOOKS_PER_ROW));
  }

  if (loading) return <div className="main-content"><p className="shelf-loading">Loading…</p></div>;

  if (error) {
    return (
      <div className="main-content">
        <p className="shelf-message">{error}</p>
        <Link to="/buddies" className="btn-primary btn-primary--inline">Back to Buddies</Link>
      </div>
    );
  }

  const activeShelf = shelves.find((s) => s.id === activeId);

  return (
    <div className="main-content">
      <BookshelfGraphic />

      <div className="buddy-shelf-header">
        <Link to="/buddies" className="buddy-shelf-back">← Buddies</Link>
        <h2 className="page-heading">{username}'s Shelves</h2>
      </div>

      <div className="shelf-tabs">
        {shelves.map((s) => (
          <button
            key={s.id}
            className={`shelf-tab${s.id === activeId ? ' shelf-tab--active' : ''}`}
            onClick={() => setActiveId(s.id)}
          >
            {s.name}
            <span className="shelf-tab-count">{s.bookCount}</span>
          </button>
        ))}
      </div>

      <div className="shelf-toolbar">
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

      {booksLoading && <p className="shelf-loading">Loading…</p>}

      {!booksLoading && books.length === 0 && (
        <div className="shelf-empty">
          <p className="shelf-empty-title">This shelf is empty.</p>
        </div>
      )}

      {rows.map((rowBooks, rowIndex) => (
        <div key={rowIndex} className="shelf-row">
          <div className="shelf-grid">
            {rowBooks.map((book) => (
              <ReadOnlyShelfCard key={book.id} book={book} />
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
