# 0006 — Admin Panel

**Status:** Shipped  
**Files:** `server/services/adminService.js`, `server/middleware/requireAdmin.js`, `server/routes/admin.js`, `client/src/pages/AdminPage.jsx`

---

## Why

The site needs a way to moderate users — removing bad actors, managing the community — without exposing private data.

---

## How to bootstrap the first admin

The first admin cannot be set through the UI (chicken-and-egg). Run this from `server/`:

```javascript
node -e "
  require('dotenv').config();
  const pool = require('./config/database');
  pool.query('UPDATE users SET is_admin = 1 WHERE username = ?', ['rebecca'])
    .then(([r]) => { console.log(r.affectedRows + ' row updated'); process.exit(0); })
    .catch(e => { console.error(e.message); process.exit(1); });
"
```

Then log out and back in (the admin flag is in the JWT — re-login required).

---

## User-facing behavior

1. Admins see a purple **Admin** button in the nav bar (`.nav-link--admin` CSS class)
2. The admin panel has two tabs: **Users** and **Public Shelves**
3. **Users tab:** table of all users — username, book count, shelf count, join date
4. Each user row has **Grant Admin** / **Revoke Admin** and **Delete** buttons (except the admin's own row — shown with a "you" tag, no actions)
5. Each destructive action shows an inline confirmation card before executing
6. After granting/revoking admin: a success notice says the target must re-login for the change to take effect
7. Admins cannot delete themselves from the admin panel (400 error)
8. **Public Shelves tab:** read-only list of all public shelves — owner, shelf name, book count

---

## Data model

**users** (existing table — adds `is_admin`)
```
is_admin BOOLEAN NOT NULL DEFAULT FALSE
```

`is_admin` is included in the JWT payload at login and registration. It is also included in the `user` object returned from `/api/auth/login` and `/api/auth/register`.

---

## API — all routes require `authenticate` + `requireAdmin`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/api/admin/users` | ✓ admin | — | `[{id, username, createdAt, isAdmin, bookCount, shelfCount}]` |
| GET | `/api/admin/shelves` | ✓ admin | — | All public shelves with owner |
| PATCH | `/api/admin/users/:id/admin` | ✓ admin | `{isAdmin: bool}` | 204 |
| DELETE | `/api/admin/users/:id` | ✓ admin | — | 204; 400 if deleting self |

---

## Client

- `AdminPage.jsx` — tabs, user table with inline confirm cards, badge for self, shelves table
- `services/adminService.js` — `getAdminUsers`, `getAdminShelves`, `setUserAdmin`, `adminDeleteUser`
- `App.jsx` — `{user.isAdmin && <NavLink to="/admin" className={() => 'nav-link nav-link--admin'}>Admin</NavLink>}`

---

## Tests

### Backend (`server/__tests__/admin.test.js`) — 11 tests
- All 4 routes return 401 without auth token
- All 4 routes return 403 with a non-admin user token
- `GET /users` — returns user list with admin token
- `GET /shelves` — returns public shelves
- `PATCH /users/:id/admin` — grants admin status
- `DELETE /users/:id` — deletes user 204
- `DELETE /users/:id` — 400 when trying to delete self (admin user deleting their own id)
