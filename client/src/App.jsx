import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SearchPage from './pages/SearchPage';
import ShelfPage from './pages/ShelfPage';
import LoginPage from './pages/LoginPage';

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <span className="nav-brand">📚 Secondhand Books</span>
        {user && (
          <nav className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
            >
              Search
            </NavLink>
            <NavLink
              to="/shelf"
              className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
            >
              My Shelf
            </NavLink>
            <span className="nav-divider">|</span>
            <span className="nav-username">{user.username}</span>
            <button className="nav-signout" onClick={handleLogout}>Sign out</button>
          </nav>
        )}
      </div>
    </header>
  );
}

function Layout() {
  const { user } = useAuth();
  return (
    <div className="app-shell">
      {user && <Nav />}
      <main className="main-content">
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
