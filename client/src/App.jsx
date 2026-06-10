import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SearchPage from './pages/SearchPage';
import ShelfPage from './pages/ShelfPage';
import LoginPage from './pages/LoginPage';

const C = {
  header: '#2C1205',
  headerText: '#F5DEB3',
  primary: '#8B1C1C',
  border: '#4A2810',
};

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    padding: '5px 14px',
    borderRadius: 5,
    fontSize: 14,
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    color: isActive ? '#FFF8EE' : '#D4AE85',
    backgroundColor: isActive ? C.primary : 'transparent',
    transition: 'background 0.15s',
  });

  return (
    <header style={{ backgroundColor: C.header, borderBottom: `1px solid ${C.border}` }}>
      <div style={{
        maxWidth: 760, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56,
      }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: C.headerText, fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}>
          📚 Secondhand Books
        </span>

        {user && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <NavLink to="/" end style={linkStyle}>Search</NavLink>
            <NavLink to="/shelf" style={linkStyle}>My Shelf</NavLink>
            <span style={{ color: '#7A5030', margin: '0 6px' }}>|</span>
            <span style={{ fontSize: 13, color: '#D4AE85', fontFamily: 'Georgia, serif' }}>
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              style={{
                marginLeft: 8, padding: '4px 12px', fontSize: 13,
                fontFamily: 'Georgia, serif',
                backgroundColor: 'transparent', color: '#D4AE85',
                border: '1px solid #4A2810', borderRadius: 5, cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

function Layout() {
  const { user } = useAuth();
  return (
    <div style={{ fontFamily: 'Georgia, serif', minHeight: '100vh', backgroundColor: '#FBF4E3' }}>
      {user && <Nav />}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/shelf" element={<ProtectedRoute><ShelfPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
