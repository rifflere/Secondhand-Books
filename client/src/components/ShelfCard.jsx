import React, { useState } from 'react';
import { formatDate } from '../utils/formatDate';

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
    <div className={`shelf-card shelf-card--spine-${book.id % 5}`}>
      <div className="shelf-card-cover">
        {book.cover ? (
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="shelf-card-no-cover">No cover available</div>
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
        <p className="shelf-card-added">Added {formatDate(book.addedAt)}</p>

        <div className="shelf-card-actions">
          {!confirming ? (
            <button className="shelf-remove-btn" onClick={() => setConfirming(true)}>
              Remove
            </button>
          ) : (
            <div className="shelf-confirm">
              <span className="shelf-confirm-text">Remove from shelf?</span>
              <div className="shelf-confirm-actions">
                <button
                  className="shelf-confirm-yes"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? '…' : 'Yes'}
                </button>
                <button
                  className="shelf-confirm-cancel"
                  onClick={() => setConfirming(false)}
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
