import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccountStats, deleteAccount } from '../services/accountService';

const AFFIRMATIONS = [
  "You've built a shelf worth coming back to.",
  "Every book you save is a little act of love for future you.",
  "Your reading life has a home here.",
  "A shelf is a self-portrait. Yours looks great.",
  "The best libraries are personal ones.",
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadErr, setLoadErr] = useState(null);

  // Delete confirmation state
  const [showDelete, setShowDelete] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const affirmation = AFFIRMATIONS[user?.id % AFFIRMATIONS.length] ?? AFFIRMATIONS[0];

  useEffect(() => {
    getAccountStats()
      .then(setStats)
      .catch(() => setLoadErr('Could not load account information.'));
  }, []);

  const handleDeleteAccount = async () => {
    if (confirmInput !== user.username) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      logout();
      navigate('/');
    } catch {
      setDeleteError('Something went wrong. Please try again.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="main-content">
      <h2 className="page-heading">My Account</h2>

      {loadErr && <p className="form-error">{loadErr}</p>}

      {stats && (
        <>
          <div className="account-card">
            <div className="account-avatar">{user.username[0].toUpperCase()}</div>
            <div className="account-info">
              <h3 className="account-username">{stats.username}</h3>
              <p className="account-since">Member since {formatDate(stats.createdAt)}</p>
              <p className="account-affirmation">{affirmation}</p>
            </div>
          </div>

          <div className="account-stats">
            <div className="account-stat">
              <span className="account-stat-number">{stats.books}</span>
              <span className="account-stat-label">{stats.books === 1 ? 'Book' : 'Books'}</span>
            </div>
            <div className="account-stat">
              <span className="account-stat-number">{stats.shelves}</span>
              <span className="account-stat-label">{stats.shelves === 1 ? 'Shelf' : 'Shelves'}</span>
            </div>
            <div className="account-stat">
              <span className="account-stat-number">{stats.buddies}</span>
              <span className="account-stat-label">{stats.buddies === 1 ? 'Buddy' : 'Buddies'}</span>
            </div>
          </div>
        </>
      )}

      <div className="account-danger-zone">
        <h4 className="account-danger-title">Danger Zone</h4>

        {!showDelete ? (
          <button
            className="account-delete-btn"
            onClick={() => setShowDelete(true)}
          >
            Delete My Account
          </button>
        ) : (
          <div className="account-delete-warning">
            <p className="account-delete-warning-text">
              This will permanently delete your account, all your shelves, every book you've saved,
              and remove you from all buddy lists. <strong>This cannot be undone.</strong>
            </p>
            <label className="account-delete-confirm-label">
              Type <strong>{user.username}</strong> to confirm:
            </label>
            <input
              className="form-input account-delete-confirm-input"
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={user.username}
              autoComplete="off"
            />
            {deleteError && <p className="form-error">{deleteError}</p>}
            <div className="account-delete-actions">
              <button
                className="shelf-delete-confirm-btn"
                onClick={handleDeleteAccount}
                disabled={confirmInput !== user.username || deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Delete Forever'}
              </button>
              <button
                className="shelf-delete-cancel-btn"
                onClick={() => { setShowDelete(false); setConfirmInput(''); setDeleteError(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
