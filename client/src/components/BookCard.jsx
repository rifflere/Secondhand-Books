import React from 'react';

const SAVE_LABEL = {
  saving: 'Saving…',
  saved: 'Saved ✓',
  duplicate: 'Already on shelf',
  error: 'Retry',
};

const SAVE_STYLE = {
  default: { backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb', cursor: 'pointer' },
  saving:  { backgroundColor: '#93c5fd', color: '#fff', borderColor: '#93c5fd', cursor: 'default' },
  saved:   { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#86efac', cursor: 'default' },
  duplicate: { backgroundColor: '#fffbeb', color: '#d97706', borderColor: '#fcd34d', cursor: 'default' },
  error:   { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5', cursor: 'pointer' },
};

export default function BookCard({ book, onSave, saveStatus }) {
  const { title, author, year, cover, pages } = book;
  const status = saveStatus || 'default';
  const isDisabled = status === 'saving' || status === 'saved' || status === 'duplicate';

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 8, padding: 16,
      display: 'flex', gap: 16, backgroundColor: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ flexShrink: 0 }}>
        {cover ? (
          <img
            src={cover}
            alt={`Cover of ${title}`}
            style={{ width: 80, height: 120, objectFit: 'cover', borderRadius: 4 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: 80, height: 120, borderRadius: 4,
            backgroundColor: '#f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: '#9ca3af', textAlign: 'center',
          }}>
            No cover
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>
          {title ?? 'Unknown Title'}
        </h3>
        <p style={{ margin: 0, color: '#4b5563', fontSize: 14 }}>
          {author ?? 'Unknown Author'}
        </p>
        <p style={{ margin: 'auto 0 0', fontSize: 12, color: '#9ca3af' }}>
          {year && <span>{year}</span>}
          {year && pages && <span style={{ margin: '0 6px' }}>·</span>}
          {pages && <span>{pages} pages</span>}
        </p>
      </div>

      {onSave && (
        <div style={{ display: 'flex', alignItems: 'flex-end', flexShrink: 0 }}>
          <button
            onClick={() => !isDisabled && onSave(book)}
            disabled={isDisabled}
            style={{
              padding: '5px 14px', fontSize: 13, borderRadius: 5,
              border: '1px solid', ...SAVE_STYLE[status],
            }}
          >
            {SAVE_LABEL[status] ?? 'Save to Shelf'}
          </button>
        </div>
      )}
    </div>
  );
}
