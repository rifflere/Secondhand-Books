import React from 'react';

export default function BookCard({ book }) {
  const { title, author, year, cover, pages } = book;

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      gap: 16,
      maxWidth: 520,
      backgroundColor: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
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
            backgroundColor: '#e9e9e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: '#999', textAlign: 'center', padding: 4,
          }}>
            No cover
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{title ?? 'Unknown Title'}</h3>
        <p style={{ margin: 0, color: '#555' }}>{author ?? 'Unknown Author'}</p>
        <div style={{ marginTop: 'auto', fontSize: 13, color: '#888' }}>
          {year && <span>{year}</span>}
          {year && pages && <span style={{ margin: '0 6px' }}>·</span>}
          {pages && <span>{pages} pages</span>}
        </div>
      </div>
    </div>
  );
}
