import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ShelfPage from './pages/ShelfPage';

const navLinkStyle = ({ isActive }) => ({
  textDecoration: 'none',
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 500,
  color: isActive ? '#fff' : '#374151',
  backgroundColor: isActive ? '#2563eb' : 'transparent',
});

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{
            maxWidth: 700, margin: '0 auto', padding: '0 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56,
          }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Secondhand Books</span>
            <nav style={{ display: 'flex', gap: 4 }}>
              <NavLink to="/" end style={navLinkStyle}>Search</NavLink>
              <NavLink to="/shelf" style={navLinkStyle}>My Shelf</NavLink>
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/shelf" element={<ShelfPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
