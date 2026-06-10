import React, { useState } from 'react';
import { formatDate } from '../utils/formatDate';

const S = {
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 16,
    display: 'flex',
    gap: 16,
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  noCover: {
    width: 80, height: 120, borderRadius: 4,
    backgroundColor: '#f3f4f6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#9ca3af', textAlign: 'center', flexShrink: 0,
  },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  title: { margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' },
  author: { margin: 0, color: '#4b5563', fontSize: 14 },
  meta: { marginTop: 'auto', fontSize: 12, color: '#9ca3af' },
  actions: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, flexShrink: 0 },
  deleteBtn: {
    padding: '5px 12px', fontSize: 13, borderRadius: 5,
    border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#ef4444', cursor: 'pointer',
  },
  confirmRow: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  confirmText: { fontSize: 12, color: '#6b7280' },
  confirmYes: {
    padding: '4px 12px', fontSize: 13, borderRadius: 5,
    border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer',
  },
  confirmNo: {
    padding: '4px 12px', fontSize: 13, borderRadius: 5,
    border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', cursor: 'pointer',
  },
};

export default function ShelfCard({ book, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(book.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div style={S.card}>
      <div style={{ flexShrink: 0 }}>
        {book.cover ? (
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            style={{ width: 80, height: 120, objectFit: 'cover', borderRadius: 4 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={S.noCover}>No cover</div>
        )}
      </div>

      <div style={S.info}>
        <h3 style={S.title}>{book.title ?? 'Unknown Title'}</h3>
        <p style={S.author}>{book.author ?? 'Unknown Author'}</p>
        <p style={S.meta}>
          {book.year && <span>{book.year}</span>}
          {book.year && book.pages && <span style={{ margin: '0 6px' }}>·</span>}
          {book.pages && <span>{book.pages} pages</span>}
        </p>
        <p style={{ ...S.meta, marginTop: 4 }}>Added {formatDate(book.addedAt)}</p>
      </div>

      <div style={S.actions}>
        {!confirming ? (
          <button style={S.deleteBtn} onClick={() => setConfirming(true)}>Remove</button>
        ) : (
          <div style={S.confirmRow}>
            <span style={S.confirmText}>Remove from shelf?</span>
            <button style={S.confirmYes} onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? 'Removing…' : 'Yes, remove'}
            </button>
            <button style={S.confirmNo} onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
