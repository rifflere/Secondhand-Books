import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <p className="footer-brand">Secondhand Books</p>
          <p className="footer-tagline">Your personal digital bookshelf.</p>
        </div>
        <div className="footer-col">
          <p className="footer-col-heading">Explore</p>
          <nav className="footer-nav">
            <Link to="/search" className="footer-link">Search Books</Link>
            <Link to="/shelf" className="footer-link">My Shelf</Link>
            <Link to="/about" className="footer-link">About</Link>
          </nav>
        </div>
        <div className="footer-col">
          <p className="footer-col-heading">Contact</p>
          <a href="mailto:rebeccaeriffle@gmail.com" className="footer-link">
            rebeccaeriffle@gmail.com
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {year} Secondhand Books · Built with care.</p>
      </div>
    </footer>
  );
}
