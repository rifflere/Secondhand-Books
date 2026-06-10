import React, { useState } from 'react';
import ShelfCard from '../components/ShelfCard';
import BookshelfGraphic from '../components/BookshelfGraphic';
import { useShelf } from '../hooks/useShelf';

const BOOKS_PER_ROW = 4;

const SORTS = [
  { value: 'date', label: 'Date Added' },
  { value: 'title', label: 'Title' },
];

const C = {
  text: '#2C1205',
  muted: '#7D5540',
  border: '#D4B080',
  primary: '#8B1C1C',
  shelfPlank: 'linear-gradient(180deg, #9B7040 0%, #7B5030 45%, #3B1F0F 100%)',
};

export default function ShelfPage() {
  const { books, loading, error, deleteBook, reload } = useShelf();
  const [sortBy, setSortBy] = useState('date');
  const [deleteError, setDeleteError] = useState(null);

  const handleSort = (sort) => {
    setSortBy(sort);
    reload(sort);
  };

  const handleDelete = async (id) => {
    setDeleteError(null);
    try {
      await deleteBook(id);
    } catch {
      setDeleteError('Failed to remove book. Please try again.');
    }
  };

  // Split books into rows for the shelf layout
  const shelves = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_ROW) {
    shelves.push(books.slice(i, i + BOOKS_PER_ROW));
  }

  return (
    <div>
      <BookshelfGraphic />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 20px' }}>
        <h2 style={{ margin: 0, fontSize: 22, color: C.text, fontFamily: 'Georgia, serif' }}>My Shelf</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {SORTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSort(value)}
              style={{
                padding: '5px 14px', fontSize: 13, borderRadius: 5, cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                border: `1px solid ${C.border}`,
                backgroundColor: sortBy === value ? C.primary : 'transparent',
                color: sortBy === value ? '#FFF8EE' : C.muted,
                fontWeight: sortBy === value ? 700 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {(error || deleteError) && (
        <p style={{ color: C.primary, fontStyle: 'italic', fontSize: 14 }}>{error || deleteError}</p>
      )}

      {loading && (
        <p style={{ color: C.muted, fontStyle: 'italic' }}>Loading your shelf…</p>
      )}

      {!loading && books.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '56px 0', color: C.muted }}>
          <p style={{ fontSize: 18, margin: 0, fontStyle: 'italic' }}>Your shelf is empty.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Search for books and save them here.</p>
        </div>
      )}

      {/* Bookshelf rows */}
      {shelves.map((rowBooks, rowIndex) => (
        <div key={rowIndex} style={{ marginBottom: 36 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${BOOKS_PER_ROW}, 1fr)`,
            gap: 14,
            paddingBottom: 6,
          }}>
            {rowBooks.map((book) => (
              <ShelfCard key={book.id} book={book} onDelete={handleDelete} />
            ))}
            {/* Fill empty slots to keep grid shape */}
            {rowBooks.length < BOOKS_PER_ROW && Array.from({ length: BOOKS_PER_ROW - rowBooks.length }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
          </div>

          {/* Wooden shelf plank */}
          <div style={{
            height: 16,
            background: C.shelfPlank,
            borderRadius: '0 0 3px 3px',
            boxShadow: '0 5px 14px rgba(0,0,0,0.28)',
          }} />
        </div>
      ))}
    </div>
  );
}
