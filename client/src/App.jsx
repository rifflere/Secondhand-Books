import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import SearchPage from './pages/SearchPage';
import ShelfPage from './pages/ShelfPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`;

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">Secondhand Books</Link>
        <nav className="nav-links">
          {user ? (
            <>
              <NavLink to="/search" className={linkClass}>Search</NavLink>
              <NavLink to="/shelf" className={linkClass}>My Shelf</NavLink>
              <NavLink to="/about" className={linkClass}>About</NavLink>
              <span className="nav-divider">|</span>
              <span className="nav-username">{user.username}</span>
              <button className="nav-signout" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <NavLink to="/about" className={linkClass}>About</NavLink>
              <NavLink to="/login" className="nav-link nav-link--cta">Sign In</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
  const { user } = useAuth();
  return user ? <DashboardPage /> : <LandingPage />;
}

function Layout() {
  return (
    <div className="app-shell">
      <Nav />
      <main className="site-main">
        <Routes>
          <Route path="/"       element={<HomePage />} />
          <Route path="/about"  element={<AboutPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/shelf"  element={<ProtectedRoute><ShelfPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
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
