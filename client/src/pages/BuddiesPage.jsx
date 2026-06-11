import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as buddiesApi from '../services/buddiesService';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function BuddiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const [buddies, setBuddies] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [b, i, o] = await Promise.all([
          buddiesApi.listBuddies(),
          buddiesApi.listIncoming(),
          buddiesApi.listOutgoing(),
        ]);
        setBuddies(b);
        setIncoming(i);
        setOutgoing(o);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setStatusMsg(null);
    try {
      setSearchResults(await buddiesApi.searchUsers(searchQuery.trim()));
    } catch {
      setStatusMsg('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (username) => {
    setStatusMsg(null);
    try {
      const result = await buddiesApi.sendBuddyRequest(username);
      if (result.autoAccepted) {
        setStatusMsg(`You and ${username} are now book buddies!`);
        const [b, i] = await Promise.all([buddiesApi.listBuddies(), buddiesApi.listIncoming()]);
        setBuddies(b); setIncoming(i);
      } else {
        setStatusMsg(`Request sent to ${username}!`);
        const o = await buddiesApi.listOutgoing();
        setOutgoing(o);
      }
      // Refresh search results to update status
      if (searchResults) {
        setSearchResults(await buddiesApi.searchUsers(searchQuery.trim()));
      }
    } catch (err) {
      setStatusMsg(err.response?.data?.error || 'Could not send request.');
    }
  };

  const handleRespond = async (id, action) => {
    try {
      await buddiesApi.respondToRequest(id, action);
      const [b, i] = await Promise.all([buddiesApi.listBuddies(), buddiesApi.listIncoming()]);
      setBuddies(b); setIncoming(i);
    } catch {
      setStatusMsg('Action failed. Please try again.');
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      await buddiesApi.removeBuddy(id);
      setOutgoing((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setStatusMsg('Could not cancel request.');
    }
  };

  const handleRemoveBuddy = async (friendshipId) => {
    try {
      await buddiesApi.removeBuddy(friendshipId);
      setBuddies((prev) => prev.filter((b) => b.friendship_id !== friendshipId));
    } catch {
      setStatusMsg('Could not remove buddy.');
    }
  };

  const statusFor = (user) => {
    if (!user.status) return 'none';
    if (user.status === 'accepted') return 'buddies';
    if (user.status === 'pending' && user.direction === 'sent') return 'sent';
    if (user.status === 'pending' && user.direction === 'received') return 'received';
    return 'none';
  };

  return (
    <div className="main-content">
      <h2 className="page-heading">Book Buddies</h2>

      {/* Search */}
      <section className="buddies-section">
        <h3 className="buddies-section-title">Find a Reader</h3>
        <form className="buddies-search-form" onSubmit={handleSearch}>
          <input
            className="buddies-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username…"
          />
          <button className="search-btn" type="submit" disabled={searching}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>

        {statusMsg && <p className="buddies-status">{statusMsg}</p>}

        {searchResults !== null && (
          <div className="buddies-results">
            {searchResults.length === 0 && (
              <p className="buddies-empty">No users found for "{searchQuery}".</p>
            )}
            {searchResults.map((u) => {
              const rel = statusFor(u);
              return (
                <div key={u.id} className="buddy-result-row">
                  <span className="buddy-result-name">{u.username}</span>
                  {rel === 'none' && (
                    <button
                      className="buddy-action-btn"
                      onClick={() => handleSendRequest(u.username)}
                    >
                      Add Buddy
                    </button>
                  )}
                  {rel === 'sent' && (
                    <span className="buddy-status-tag buddy-status-tag--pending">Request sent</span>
                  )}
                  {rel === 'received' && (
                    <span className="buddy-status-tag buddy-status-tag--pending">They sent you a request!</span>
                  )}
                  {rel === 'buddies' && (
                    <span className="buddy-status-tag buddy-status-tag--active">Buddies</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {!loading && incoming.length > 0 && (
        <section className="buddies-section">
          <h3 className="buddies-section-title">
            Incoming Requests
            <span className="buddies-count-badge">{incoming.length}</span>
          </h3>
          <div className="buddies-list">
            {incoming.map((req) => (
              <div key={req.id} className="buddy-card buddy-card--request">
                <span className="buddy-card-name">{req.from_username}</span>
                <span className="buddy-card-meta">wants to be your book buddy</span>
                <div className="buddy-card-actions">
                  <button
                    className="buddy-accept-btn"
                    onClick={() => handleRespond(req.id, 'accept')}
                  >
                    Accept
                  </button>
                  <button
                    className="buddy-decline-btn"
                    onClick={() => handleRespond(req.id, 'decline')}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && (
        <section className="buddies-section">
          <h3 className="buddies-section-title">
            My Buddies
            {buddies.length > 0 && (
              <span className="buddies-count-badge">{buddies.length}</span>
            )}
          </h3>
          {buddies.length === 0 ? (
            <p className="buddies-empty">
              No book buddies yet. Search for readers above to get started!
            </p>
          ) : (
            <div className="buddies-list">
              {buddies.map((b) => (
                <div key={b.friendship_id} className="buddy-card">
                  <div className="buddy-card-avatar">{b.username[0].toUpperCase()}</div>
                  <div className="buddy-card-info">
                    <span className="buddy-card-name">{b.username}</span>
                    <span className="buddy-card-meta">
                      buddies since {new Date(b.friends_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="buddy-card-actions">
                    <Link
                      to={`/buddies/${b.username}`}
                      className="buddy-shelves-link"
                    >
                      View Shelves
                    </Link>
                    <button
                      className="buddy-remove-btn"
                      onClick={() => handleRemoveBuddy(b.friendship_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && outgoing.length > 0 && (
        <section className="buddies-section">
          <h3 className="buddies-section-title">Sent Requests</h3>
          <div className="buddies-list">
            {outgoing.map((req) => (
              <div key={req.id} className="buddy-card buddy-card--outgoing">
                <span className="buddy-card-name">{req.to_username}</span>
                <span className="buddy-card-meta">request pending · {timeAgo(req.created_at)}</span>
                <button
                  className="buddy-remove-btn"
                  onClick={() => handleCancelRequest(req.id)}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
