import React from 'react';
import { Link } from 'react-router-dom';
import { usePopular } from '../hooks/usePopular';
import BookCard from '../components/BookCard';

export default function LandingPage() {
  const { books: popular, loading } = usePopular();

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">Welcome to</p>
          <h1 className="hero-title">Secondhand Books</h1>
          <p className="hero-sub">
            Search millions of books, build your reading list, and discover
            what other readers are saving right now.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="hero-btn hero-btn--primary">Sign In</Link>
            <Link to="/login" className="hero-btn hero-btn--ghost">Create Account</Link>
          </div>
        </div>
      </section>

      {!loading && popular.length > 0 && (
        <section className="landing-popular">
          <div className="main-content">
            <h2 className="landing-section-title">What Readers Are Saving</h2>
            <p className="landing-section-sub">
              The most-saved books across all readers right now.
            </p>
            <div className="search-results">
              {popular.slice(0, 5).map((book, i) => (
                <BookCard
                  key={book.olKey || i}
                  book={book}
                  saveCount={book.saveCount}
                />
              ))}
            </div>
            <div className="landing-join-row">
              <Link to="/login" className="btn-primary btn-primary--inline">
                Join to save books →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
