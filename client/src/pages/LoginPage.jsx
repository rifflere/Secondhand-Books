import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, register as registerApi } from '../services/authService';

const C = {
  bg: '#FBF4E3',
  card: '#FFF8EE',
  border: '#D4B080',
  primary: '#8B1C1C',
  primaryHover: '#6B1414',
  text: '#2C1205',
  muted: '#7D5540',
  input: '#FFF8EE',
  error: '#8B1C1C',
};

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fn = mode === 'login' ? loginApi : registerApi;
      const { token, user } = await fn(username.trim(), password);
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        backgroundColor: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '40px 36px', width: '100%', maxWidth: 400,
        boxShadow: '0 4px 24px rgba(44,18,5,0.12)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
          <h1 style={{ margin: 0, fontSize: 24, color: C.text, fontWeight: 700 }}>
            Secondhand Books
          </h1>
          <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 14 }}>
            Your personal reading shelf
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: `2px solid ${C.border}`, marginBottom: 28,
        }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '10px 0', fontSize: 14, fontFamily: 'Georgia, serif',
                fontWeight: mode === m ? 700 : 400,
                color: mode === m ? C.primary : C.muted,
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: mode === m ? `3px solid ${C.primary}` : '3px solid transparent',
                marginBottom: -2,
                textTransform: 'capitalize',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: C.muted, marginBottom: 6, fontFamily: 'Georgia, serif' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              style={{
                width: '100%', padding: '10px 12px', fontSize: 15,
                border: `1px solid ${C.border}`, borderRadius: 6,
                backgroundColor: C.input, color: C.text,
                fontFamily: 'Georgia, serif', boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: C.muted, marginBottom: 6, fontFamily: 'Georgia, serif' }}>
              Password {mode === 'register' && <span style={{ color: C.muted, fontWeight: 400 }}>(min. 6 characters)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              style={{
                width: '100%', padding: '10px 12px', fontSize: 15,
                border: `1px solid ${C.border}`, borderRadius: 6,
                backgroundColor: C.input, color: C.text,
                fontFamily: 'Georgia, serif', boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: C.error, fontStyle: 'italic' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, padding: '11px 0', fontSize: 15,
              fontFamily: 'Georgia, serif', fontWeight: 700,
              backgroundColor: loading ? '#C4766B' : C.primary,
              color: '#FFF8EE', border: 'none', borderRadius: 6,
              cursor: loading ? 'default' : 'pointer',
              letterSpacing: '0.03em',
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
