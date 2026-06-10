import React, { useState } from 'react';
import ShelfCard from '../components/ShelfCard';
import { useShelf } from '../hooks/useShelf';

const SORTS = [
  { value: 'date', label: 'Date Added' },
  { value: 'title', label: 'Title' },
];

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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: '#111827' }}>My Shelf</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {SORTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSort(value)}
              style={{
                padding: '5px 14px', fontSize: 13, borderRadius: 5, cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: sortBy === value ? '#2563eb' : '#fff',
                color: sortBy === value ? '#fff' : '#374151',
                fontWeight: sortBy === value ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {deleteError && <p style={{ color: '#dc2626' }}>{deleteError}</p>}

      {loading && <p style={{ color: '#6b7280' }}>Loading your shelf…</p>}

      {!loading && books.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
          <p style={{ fontSize: 16, margin: 0 }}>Your shelf is empty.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Search for books and save them here.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {books.map((book) => (
          <ShelfCard key={book.id} book={book} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
