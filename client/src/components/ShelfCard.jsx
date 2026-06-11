import React, { useState, useRef, useEffect } from 'react';
import { formatDate } from '../utils/formatDate';

export default function ShelfCard({ book, onDelete, allShelves, currentShelfId, onAddToShelf }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showShelfMenu, setShowShelfMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowShelfMenu(false);
      }
    };
    if (showShelfMenu) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showShelfMenu]);

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
              <span className="shelf-confirm-text">Remove?</span>
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
                  No
                </button>
              </div>
            </div>
          )}

          {onAddToShelf && allShelves && (
            <div className="shelf-card-add-to" ref={menuRef}>
              <button
                className="shelf-add-btn"
                onClick={() => setShowShelfMenu((v) => !v)}
                title="Add to another shelf"
              >
                + Shelf
              </button>
              {showShelfMenu && (
                <div className="shelf-card-menu">
                  {allShelves
                    .filter((s) => s.id !== currentShelfId)
                    .map((s) => (
                      <button
                        key={s.id}
                        className="shelf-card-menu-item"
                        onClick={() => {
                          onAddToShelf(book.id, s.id);
                          setShowShelfMenu(false);
                        }}
                      >
                        {s.name}
                      </button>
                    ))}
                  {allShelves.filter((s) => s.id !== currentShelfId).length === 0 && (
                    <span className="shelf-card-menu-empty">No other shelves</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
