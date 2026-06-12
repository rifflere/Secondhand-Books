# 0005 — Account Page

**Status:** Shipped  
**Files:** `server/services/accountService.js`, `server/routes/account.js`, `client/src/pages/AccountPage.jsx`

---

## Why

Users need a place to see how they're using the app and a self-service way to leave permanently if they choose.

---

## User-facing behavior

1. The account page is reached by clicking the username in the nav bar
2. Shows: avatar (first letter of username), username, join date, a rotating affirmation message
3. Stats row: total books saved, shelves created, buddy count
4. Danger Zone section with "Delete My Account" button
5. Clicking delete expands a confirmation panel: "This cannot be undone" warning
6. User must type their exact username before the "Delete Forever" button enables
7. On deletion: all user data is removed (cascades via FK), user is logged out, redirected to `/`

---

## Data model

No new tables. Deletion relies on `ON DELETE CASCADE` on all foreign keys referencing `users.id`.

---

## API

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/account/stats` | ✓ | `{username, createdAt, books, shelves, buddies}` |
| DELETE | `/api/account` | ✓ | 204 |

**Stats query:** 4 separate `COUNT(*)` queries — one each for books, shelves, buddy count (friendships where accepted), and the user's `created_at`.

---

## Client

- `AccountPage.jsx` — stats card, affirmation, danger zone with typed-confirm deletion
- `services/accountService.js` — `getAccountStats()`, `deleteAccount()`
- `App.jsx` — nav username is a `<NavLink to="/account">`

---

## Tests

### Backend (`server/__tests__/account.test.js`) — 4 tests
- `GET /stats` — requires auth, returns stats object
- `DELETE /` — requires auth, calls delete service

### Frontend (`client/src/tests/pages/AccountPage.test.jsx`) — 8 tests
- Shows username and join date (use noon-UTC dates in mocks to avoid timezone flips)
- Shows book/shelf/buddy stats
- Error state when stats load fails
- Delete confirmation appears on button click
- "Delete Forever" disabled until username matches exactly
- Successful delete: calls deleteAccount, calls logout, navigates to /
- Error on deletion failure
- Cancel hides the confirmation panel
