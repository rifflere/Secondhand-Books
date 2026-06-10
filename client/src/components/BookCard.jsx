import React from 'react';

const SAVE_LABEL = {
  saving:    'Saving…',
  saved:     'Saved ✓',
  duplicate: 'Already on shelf',
  error:     'Retry',
};

export default function BookCard({ book, onSave, saveStatus }) {
  const { title, author, year, cover, pages } = book;
  const status = saveStatus || 'default';
  const isDisabled = status === 'saving' || status === 'saved' || status === 'duplicate';

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
      </div>

      {onSave && (
        <div className="book-card-actions">
          <button
            className={`save-btn save-btn--${status}`}
            onClick={() => !isDisabled && onSave(book)}
            disabled={isDisabled}
          >
            {SAVE_LABEL[status] ?? 'Save to Shelf'}
          </button>
        </div>
      )}
    </div>
  );
}
