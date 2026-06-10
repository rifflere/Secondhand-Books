import React, { useState } from 'react';
import { formatDate } from '../utils/formatDate';

const C = {
  card: '#FFF8EE',
  border: '#D4B080',
  text: '#2C1205',
  muted: '#7D5540',
  dimmed: '#A07858',
  noCover: '#EDE0C8',
  danger: '#8B1C1C',
  dangerBorder: '#C49090',
  confirmYesBg: '#8B1C1C',
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
    <div style={{
      backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(44,18,5,0.10)',
      transition: 'box-shadow 0.15s',
    }}>
      {/* Cover */}
      <div style={{ position: 'relative', backgroundColor: C.noCover }}>
        {book.cover ? (
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: '100%', aspectRatio: '2/3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: C.muted, textAlign: 'center', padding: 8,
            fontStyle: 'italic',
          }}>
            No cover available
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <h3 style={{
          margin: 0, fontSize: 13, fontWeight: 700, color: C.text,
          fontFamily: 'Georgia, serif', lineHeight: 1.3,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {book.title ?? 'Unknown Title'}
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
          {book.author ?? 'Unknown Author'}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: C.dimmed }}>
          {book.year && <span>{book.year}</span>}
          {book.year && book.pages && <span style={{ margin: '0 4px' }}>·</span>}
          {book.pages && <span>{book.pages}p</span>}
        </p>
        <p style={{ margin: '1px 0 0', fontSize: 10, color: C.dimmed }}>
          Added {formatDate(book.addedAt)}
        </p>

        {/* Delete action */}
        <div style={{ marginTop: 8 }}>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              style={{
                padding: '3px 10px', fontSize: 11, borderRadius: 4,
                border: `1px solid ${C.dangerBorder}`, backgroundColor: 'transparent',
                color: C.danger, cursor: 'pointer', fontFamily: 'Georgia, serif',
              }}
            >
              Remove
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 11, color: C.muted, fontStyle: 'italic' }}>Remove from shelf?</span>
              <div style={{ display: 'flex', gap: 5 }}>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  style={{
                    flex: 1, padding: '3px 0', fontSize: 11, borderRadius: 4,
                    border: 'none', backgroundColor: C.confirmYesBg,
                    color: '#FFF8EE', cursor: 'pointer', fontFamily: 'Georgia, serif',
                  }}
                >
                  {deleting ? '…' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  style={{
                    flex: 1, padding: '3px 0', fontSize: 11, borderRadius: 4,
                    border: `1px solid ${C.border}`, backgroundColor: 'transparent',
                    color: C.muted, cursor: 'pointer', fontFamily: 'Georgia, serif',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
