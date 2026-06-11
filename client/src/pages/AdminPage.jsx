import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminUsers, getAdminShelves, setUserAdmin, adminDeleteUser } from '../services/adminService';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('users');

  const [users, setUsers]     = useState([]);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);

  // { type: 'delete'|'grant'|'revoke', userId, username }
  const [confirm, setConfirm]   = useState(null);
  const [actionErr, setActionErr] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [busy, setBusy]         = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const [u, s] = await Promise.all([getAdminUsers(), getAdminShelves()]);
      setUsers(u);
      setShelves(s);
    } catch {
      setLoadErr('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    setActionErr(null);
    setActionMsg(null);
    try {
      if (confirm.type === 'delete') {
        await adminDeleteUser(confirm.userId);
        setUsers((prev) => prev.filter((u) => u.id !== confirm.userId));
        setActionMsg(`${confirm.username} has been deleted.`);
      } else {
        const isAdmin = confirm.type === 'grant';
        await setUserAdmin(confirm.userId, isAdmin);
        setUsers((prev) => prev.map((u) =>
          u.id === confirm.userId ? { ...u, is_admin: isAdmin } : u
        ));
        setActionMsg(
          isAdmin
            ? `${confirm.username} is now an admin. They'll see the Admin button after their next sign-in.`
            : `Admin access removed from ${confirm.username}.`
        );
      }
      setConfirm(null);
    } catch (err) {
      setActionErr(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="main-content">
      <h2 className="page-heading">Admin Panel</h2>

      {actionMsg && (
        <div className="admin-notice admin-notice--success">
          {actionMsg}
          <button className="admin-notice-close" onClick={() => setActionMsg(null)}>✕</button>
        </div>
      )}

      {confirm && (
        <div className="admin-confirm-card">
          <p className="admin-confirm-text">
            {confirm.type === 'delete' && (
              <>Permanently delete <strong>{confirm.username}</strong>? This removes all their books, shelves, and buddy connections.</>
            )}
            {confirm.type === 'grant' && (
              <>Grant admin powers to <strong>{confirm.username}</strong>? They will be able to view all users and delete accounts.</>
            )}
            {confirm.type === 'revoke' && (
              <>Remove admin access from <strong>{confirm.username}</strong>?</>
            )}
          </p>
          {actionErr && <p className="form-error">{actionErr}</p>}
          <div className="admin-confirm-actions">
            <button
              className={confirm.type === 'delete' ? 'shelf-delete-confirm-btn' : 'btn-primary'}
              onClick={handleConfirm}
              disabled={busy}
            >
              {busy ? 'Working…' : 'Confirm'}
            </button>
            <button
              className="shelf-delete-cancel-btn"
              onClick={() => { setConfirm(null); setActionErr(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'users' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('users')}
        >
          Users <span className="admin-tab-count">({users.length})</span>
        </button>
        <button
          className={`admin-tab${tab === 'shelves' ? ' admin-tab--active' : ''}`}
          onClick={() => setTab('shelves')}
        >
          Public Shelves <span className="admin-tab-count">({shelves.length})</span>
        </button>
      </div>

      {loading && <p className="admin-loading">Loading…</p>}
      {loadErr  && <p className="form-error">{loadErr}</p>}

      {!loading && tab === 'users' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Joined</th>
                <th>Books</th>
                <th>Shelves</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.id === user.id ? 'admin-row--self' : ''}>
                  <td className="admin-col-username">
                    {u.username}
                    {u.id === user.id && <span className="admin-self-tag">you</span>}
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>{u.book_count}</td>
                  <td>{u.shelf_count}</td>
                  <td>
                    {u.is_admin
                      ? <span className="admin-badge">Admin</span>
                      : <span className="admin-user-tag">User</span>}
                  </td>
                  <td className="admin-col-actions">
                    {u.id !== user.id && (
                      <>
                        <button
                          className={u.is_admin ? 'admin-action-btn admin-action-btn--revoke' : 'admin-action-btn admin-action-btn--grant'}
                          onClick={() => {
                            setConfirm({ type: u.is_admin ? 'revoke' : 'grant', userId: u.id, username: u.username });
                            setActionErr(null);
                          }}
                        >
                          {u.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                        </button>
                        <button
                          className="admin-action-btn admin-action-btn--delete"
                          onClick={() => {
                            setConfirm({ type: 'delete', userId: u.id, username: u.username });
                            setActionErr(null);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'shelves' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Shelf</th>
                <th>Owner</th>
                <th>Books</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {shelves.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.owner_username}</td>
                  <td>{s.book_count}</td>
                  <td>
                    {s.is_default
                      ? <span className="admin-shelf-tag admin-shelf-tag--main">Main</span>
                      : <span className="admin-shelf-tag admin-shelf-tag--custom">Custom</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
