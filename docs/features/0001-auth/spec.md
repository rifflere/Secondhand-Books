# 0001 — Authentication & Account Recovery

**Status:** Shipped  
**Files:** `server/services/authService.js`, `server/routes/auth.js`, `client/src/pages/LoginPage.jsx`, `client/src/pages/ResetPasswordPage.jsx`

---

## Why

Users need accounts to save books. Email is used for recovery only — not for login — and is never shown to other users.

---

## User-facing behavior

1. A visitor can register with a username, email (required for recovery), and password (min 6 chars)
2. Duplicate usernames are rejected with a clear error
3. Duplicate emails are rejected; the error does not reveal which user owns that email
4. A user signs in with username + password
5. Incorrect credentials return a vague "Invalid username or password" (do not reveal which was wrong)
6. "Forgot username or password?" expands a recovery panel on the login page
7. **Get my username** — user enters email → server emails the username to that address
8. **Reset my password** — user enters username + email; if they match, server sends a 1-hour reset link
9. The reset link opens `/reset-password?token=…`; the token is validated on page load; user sets a new password
10. Used or expired tokens show an error with a link back to the login page

---

## Data model

**users** (existing table — adds `email` and `is_admin`)
```
email VARCHAR(255) UNIQUE NULL
is_admin BOOLEAN NOT NULL DEFAULT FALSE
```

**password_reset_tokens** (new table)
```
id INT PK AUTO_INCREMENT
user_id INT → users(id) ON DELETE CASCADE
token CHAR(64) UNIQUE NOT NULL       -- crypto.randomBytes(32).toString('hex')
expires_at DATETIME NOT NULL          -- 1 hour from creation
used_at DATETIME NULL                 -- set on successful reset
created_at TIMESTAMP
```

---

## API

| Method | Path | Auth | Body / Params | Response |
|--------|------|------|---------------|----------|
| POST | `/api/auth/register` | — | `{username, password, email}` | `{token, user: {id, username, isAdmin}}` |
| POST | `/api/auth/login` | — | `{username, password}` | `{token, user: {id, username, isAdmin}}` |
| POST | `/api/auth/recover` | — | `{type: 'username'\|'password', email, username?}` | 200 |
| GET | `/api/auth/validate-token/:token` | — | — | `{valid: true, username}` or 400 |
| POST | `/api/auth/reset-password` | — | `{token, newPassword}` | 200 |

**JWT payload:** `{ id, username, isAdmin }` — 7-day expiry, signed with `JWT_SECRET` from env.

---

## Client

- `LoginPage.jsx` — tabs (sign-in / create-account), recovery panel, email field in register mode
- `ResetPasswordPage.jsx` — reads `?token=` from URL, validates on mount, password form
- `AuthContext.jsx` — `login(user, token)` writes to `localStorage`; `logout()` clears it
- `services/authService.js` — `login`, `register`, `recoverAccount`, `validateResetToken`, `resetPassword`

---

## Tests

### Backend (`server/__tests__/auth.test.js`) — 19 tests
- `POST /register` — success, duplicate username 409, duplicate email 409, missing fields 400, invalid email 400
- `POST /login` — success, wrong password 401, unknown user 401
- `POST /recover` — username mode (success), password mode (success, mismatched)
- `GET /validate-token/:token` — valid token, invalid/expired token
- `POST /reset-password` — success, invalid token

### Frontend (`client/src/tests/pages/LoginPage.test.jsx`) — 12 tests
- Sign in: renders fields, submits + redirects, shows server error, shows generic error
- Create account: shows email field, shows password hint, submits + redirects
- Recovery: hidden by default, opens, closes, submits username recovery + shows success
