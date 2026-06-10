import React from 'react';

const C = {
  card: '#FFF8EE',
  border: '#D4B080',
  text: '#2C1205',
  muted: '#7D5540',
  primary: '#8B1C1C',
  noCover: '#EDE0C8',
};

const SAVE_LABEL = {
  saving:    'Saving…',
  saved:     'Saved ✓',
  duplicate: 'Already on shelf',
  error:     'Retry',
};

const SAVE_STYLE = {
  default:   { backgroundColor: C.primary,  color: '#FFF8EE', borderColor: C.primary,   cursor: 'pointer' },
  saving:    { backgroundColor: '#C4766B',  color: '#FFF8EE', borderColor: '#C4766B',   cursor: 'default' },
  saved:     { backgroundColor: '#EEF5E4',  color: '#4A6A20', borderColor: '#A0B870',   cursor: 'default' },
  duplicate: { backgroundColor: '#FBF0D8',  color: '#8B6020', borderColor: '#C4A050',   cursor: 'default' },
  error:     { backgroundColor: '#FBF0F0',  color: C.primary, borderColor: '#D4A0A0',   cursor: 'pointer' },
};

export default function BookCard({ book, onSave, saveStatus }) {
  const { title, author, year, cover, pages } = book;
  const status = saveStatus || 'default';
  const isDisabled = status === 'saving' || status === 'saved' || status === 'duplicate';

  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 8, padding: 14,
      display: 'flex', gap: 14, backgroundColor: C.card,
      boxShadow: '0 1px 4px rgba(44,18,5,0.08)',
    }}>
      <div style={{ flexShrink: 0 }}>
        {cover ? (
          <img
            src={cover}
            alt={`Cover of ${title}`}
            style={{ width: 72, height: 108, objectFit: 'cover', borderRadius: 3, display: 'block' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: 72, height: 108, borderRadius: 3,
            backgroundColor: C.noCover, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: C.muted, textAlign: 'center', padding: 4,
          }}>
            No cover
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'Georgia, serif' }}>
          {title ?? 'Unknown Title'}
        </h3>
        <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>
          {author ?? 'Unknown Author'}
        </p>
        <p style={{ margin: 'auto 0 0', fontSize: 12, color: '#A07858' }}>
          {year && <span>{year}</span>}
          {year && pages && <span style={{ margin: '0 5px' }}>·</span>}
          {pages && <span>{pages} pages</span>}
        </p>
      </div>

      {onSave && (
        <div style={{ display: 'flex', alignItems: 'flex-end', flexShrink: 0 }}>
          <button
            onClick={() => !isDisabled && onSave(book)}
            disabled={isDisabled}
            style={{
              padding: '5px 12px', fontSize: 12, borderRadius: 5,
              fontFamily: 'Georgia, serif', border: '1px solid',
              ...SAVE_STYLE[status],
            }}
          >
            {SAVE_LABEL[status] ?? 'Save to Shelf'}
          </button>
        </div>
      )}
    </div>
  );
}
