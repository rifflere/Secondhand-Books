import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShelf } from '../hooks/useShelf';
import { usePopular } from '../hooks/usePopular';
import { getFeed, listBuddies } from '../services/buddiesService';

function BookThumb({ book }) {
  return (
    <div className="book-thumb">
      {book.cover ? (
        <img
          src={book.cover}
          alt={book.title}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="book-thumb-no-cover">
          {(book.title || '?')[0].toUpperCase()}
        </div>
      )}
      <p className="book-thumb-title">{book.title}</p>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { books, loading: shelfLoading } = useShelf();
  const { books: popular, loading: popularLoading } = usePopular();
  const [feed, setFeed] = useState([]);
  const [buddies, setBuddies] = useState([]);

  useEffect(() => {
    getFeed().then(setFeed).catch(() => {});
    listBuddies().then(setBuddies).catch(() => {});
  }, []);

  const now = new Date();
  const thisMonth = books.filter((b) => {
    const d = new Date(b.addedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const recent = books.slice(0, 5);
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="main-content">
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h2 className="dashboard-greeting">Welcome back, {user?.username}.</h2>
            <p className="dashboard-date">{dateLabel}</p>
          </div>
          <Link to="/search" className="btn-primary btn-primary--inline">
            Search Books
          </Link>
        </div>

        <div className="stat-grid">
          <div className="stat-card stat-card--red">
            <span className="stat-number">{shelfLoading ? '—' : books.length}</span>
            <span className="stat-label">books on shelf</span>
          </div>
          <div className="stat-card stat-card--orange">
            <span className="stat-number">{shelfLoading ? '—' : thisMonth}</span>
            <span className="stat-label">added this month</span>
          </div>
          <div className="stat-card stat-card--brown">
            <span className="stat-number">
              {popularLoading ? '—' : (popular[0]?.saveCount ?? 0)}
            </span>
            <span className="stat-label">saves for #1 book</span>
          </div>
        </div>

        {!shelfLoading && books.length === 0 && (
          <section className="dashboard-section">
            <div className="dashboard-empty-state">
              <p className="dashboard-empty-text">Your shelf is empty — let's fix that.</p>
              <Link to="/search" className="btn-primary btn-primary--inline">
                Find your first book →
              </Link>
            </div>
          </section>
        )}

        {!shelfLoading && recent.length > 0 && (
          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Recently Added</h3>
              <Link to="/shelves" className="dashboard-section-link">View shelf →</Link>
            </div>
            <div className="book-thumb-row">
              {recent.map((book) => (
                <BookThumb key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}

        {buddies.length > 0 && (
          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Book Buddies</h3>
              <Link to="/buddies" className="dashboard-section-link">Manage →</Link>
            </div>
            <div className="buddies-dashboard-row">
              {buddies.slice(0, 6).map((b) => (
                <Link key={b.friendship_id} to={`/buddies/${b.username}`} className="buddy-avatar-link" title={b.username}>
                  <div className="buddy-avatar">{b.username[0].toUpperCase()}</div>
                  <span className="buddy-avatar-name">{b.username}</span>
                </Link>
              ))}
              {buddies.length > 6 && (
                <Link to="/buddies" className="buddy-avatar-link">
                  <div className="buddy-avatar buddy-avatar--more">+{buddies.length - 6}</div>
                </Link>
              )}
            </div>
          </section>
        )}

        {feed.length > 0 && (
          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Buddy Activity</h3>
            </div>
            <div className="feed-list">
              {feed.slice(0, 8).map((item, i) => (
                <div key={i} className="feed-item">
                  <div className="feed-avatar">{item.username[0].toUpperCase()}</div>
                  <div className="feed-info">
                    <span className="feed-username">{item.username}</span>
                    {' added '}
                    <span className="feed-book-title">{item.title}</span>
                    {' to '}
                    <Link to={`/buddies/${item.username}`} className="feed-shelf-link">{item.shelfName}</Link>
                  </div>
                  <span className="feed-time">{timeAgo(item.activityAt)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {!popularLoading && popular.length > 0 && (
          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">What's Popular</h3>
              <Link to="/search" className="dashboard-section-link">Search books →</Link>
            </div>
            <div className="popular-compact-list">
              {popular.slice(0, 5).map((book, i) => (
                <div key={book.olKey || i} className="popular-compact-item">
                  <span className="popular-compact-rank">{i + 1}</span>
                  {book.cover && (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="popular-compact-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="popular-compact-info">
                    <p className="popular-compact-title">{book.title}</p>
                    <p className="popular-compact-author">{book.author}</p>
                  </div>
                  <span className="popular-compact-count">
                    {book.saveCount} {book.saveCount === 1 ? 'save' : 'saves'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
