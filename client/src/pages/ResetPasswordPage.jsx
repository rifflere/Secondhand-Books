import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { validateResetToken, resetPassword } from '../services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [tokenState, setTokenState] = useState('checking'); // checking | valid | invalid
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setTokenState('invalid'); return; }
    validateResetToken(token)
      .then(() => setTokenState('valid'))
      .catch(() => setTokenState('invalid'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">📚</div>
          <h1 className="login-title">Reset Password</h1>
        </div>

        {tokenState === 'checking' && (
          <p className="reset-status">Verifying your link…</p>
        )}

        {tokenState === 'invalid' && (
          <div className="reset-invalid">
            <p>This link is invalid or has expired. Password reset links are only valid for 1 hour.</p>
            <Link to="/login" className="btn-primary reset-back-link">Back to Sign In</Link>
          </div>
        )}

        {tokenState === 'valid' && !done && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                New Password <span className="form-label-hint">(min. 6 characters)</span>
              </label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                className="form-input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Set New Password'}
            </button>
          </form>
        )}

        {done && (
          <div className="reset-done">
            <p>Your password has been updated!</p>
            <Link to="/login" className="btn-primary reset-back-link">Sign In</Link>
          </div>
        )}
      </div>
    </div>
  );
}
