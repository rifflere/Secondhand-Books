import React, { useState, useRef, useEffect } from 'react';

export default function BookCard({ book, onSave, saveStatus, saveCount, shelves }) {
  const { title, author, year, cover, pages } = book;
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  const status = saveStatus || 'default';
  const isSettled = status === 'saved' || status === 'duplicate';

  // Close picker when status resolves (saved / error) or on outside click
  useEffect(() => {
    if (status !== 'default') setShowPicker(false);
  }, [status]);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  const handleSaveClick = () => {
    if (isSettled || status === 'saving') return;
    if (shelves && shelves.length > 0) {
      setShowPicker(true);
    } else {
      onSave(book);
    }
  };

  const handlePickShelf = (shelfId) => {
    setShowPicker(false);
    onSave(book, shelfId);
  };

  const saveLabel = {
    saving:    'Saving…',
    saved:     'Saved ✓',
    duplicate: 'Already saved',
    error:     'Retry',
  }[status] ?? 'Save to Shelf';

  return (
    <div className="book-card">
      <div className="book-card-cover">
        {cover ? (
          <img
            src={cover}
            alt={`Cover of ${title}`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="book-card-no-cover">No cover</div>
        )}
      </div>

      <div className="book-card-info">
        <h3 className="book-card-title">{title ?? 'Unknown Title'}</h3>
        <p className="book-card-author">{author ?? 'Unknown Author'}</p>
        <p className="book-card-meta">
          {year && <span>{year}</span>}
          {year && pages && <span> · </span>}
          {pages && <span>{pages} pages</span>}
        </p>
        {saveCount > 0 && (
          <p className="book-card-popularity">
            Saved by {saveCount} {saveCount === 1 ? 'reader' : 'readers'}
          </p>
        )}
      </div>

      {onSave && (
        <div className="book-card-actions" ref={pickerRef}>
          {showPicker ? (
            <div className="book-shelf-picker">
              <span className="book-shelf-picker-label">Add to:</span>
              <div className="book-shelf-picker-list">
                {shelves.map((s) => (
                  <button
                    key={s.id}
                    className="book-shelf-pick-btn"
                    onClick={() => handlePickShelf(s.id)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <button
                className="book-shelf-pick-cancel"
                onClick={() => setShowPicker(false)}
                aria-label="Cancel"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              className={`save-btn save-btn--${status}`}
              onClick={handleSaveClick}
              disabled={isSettled || status === 'saving'}
            >
              {saveLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
