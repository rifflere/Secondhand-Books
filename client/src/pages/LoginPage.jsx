import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, register as registerApi, recoverAccount } from '../services/authService';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Recovery state
  const [showRecover, setShowRecover] = useState(false);
  const [recoverType, setRecoverType] = useState('username');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverUsername, setRecoverUsername] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverMsg, setRecoverMsg] = useState(null);
  const [recoverError, setRecoverError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { token, user } = await loginApi(username.trim(), password);
        login(user, token);
        navigate('/');
      } else {
        const { token, user } = await registerApi(username.trim(), password, email.trim());
        login(user, token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    setRecoverError(null);
    setRecoverMsg(null);
    setRecoverLoading(true);
    try {
      await recoverAccount(recoverType, recoverEmail.trim(), recoverUsername.trim());
      setRecoverMsg('Check your email — if we found a matching account, instructions are on their way.');
    } catch (err) {
      setRecoverError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setRecoverLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setShowRecover(false);
    setRecoverMsg(null);
    setRecoverError(null);
  };

  const toggleRecover = () => {
    setShowRecover((v) => !v);
    setRecoverMsg(null);
    setRecoverError(null);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">📚</div>
          <h1 className="login-title">Secondhand Books</h1>
          <p className="login-subtitle">Your personal reading shelf</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab${mode === 'login' ? ' login-tab--active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            className={`login-tab${mode === 'register' ? ' login-tab--active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Create Account
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">
                Email <span className="form-label-hint">(for account recovery only)</span>
              </label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Password{' '}
              {mode === 'register' && (
                <span className="form-label-hint">(min. 6 characters)</span>
              )}
            </label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <div className="recover-section">
            <button
              type="button"
              className="recover-toggle"
              onClick={toggleRecover}
            >
              {showRecover ? 'Never mind' : 'Forgot username or password?'}
            </button>

            {showRecover && (
              <div className="recover-panel">
                <div className="recover-type-tabs">
                  <button
                    type="button"
                    className={`recover-type-tab${recoverType === 'username' ? ' recover-type-tab--active' : ''}`}
                    onClick={() => { setRecoverType('username'); setRecoverMsg(null); setRecoverError(null); }}
                  >
                    Get my username
                  </button>
                  <button
                    type="button"
                    className={`recover-type-tab${recoverType === 'password' ? ' recover-type-tab--active' : ''}`}
                    onClick={() => { setRecoverType('password'); setRecoverMsg(null); setRecoverError(null); }}
                  >
                    Reset my password
                  </button>
                </div>

                {recoverMsg ? (
                  <p className="recover-success">{recoverMsg}</p>
                ) : (
                  <form className="recover-form" onSubmit={handleRecover}>
                    {recoverType === 'password' && (
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                          className="form-input"
                          type="text"
                          value={recoverUsername}
                          onChange={(e) => setRecoverUsername(e.target.value)}
                          autoComplete="username"
                          required
                        />
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Email address</label>
                      <input
                        className="form-input"
                        type="email"
                        value={recoverEmail}
                        onChange={(e) => setRecoverEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                    {recoverError && <p className="form-error">{recoverError}</p>}
                    <button className="btn-secondary" type="submit" disabled={recoverLoading}>
                      {recoverLoading ? 'Sending…' : recoverType === 'username' ? 'Email me my username' : 'Send reset link'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
