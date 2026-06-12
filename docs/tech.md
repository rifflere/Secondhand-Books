# Technical Reference

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, plain CSS |
| Backend | Node.js 18+, Express 4 (CommonJS — `require`/`module.exports`) |
| Database | MySQL 8 / MariaDB via `mysql2/promise` connection pool |
| Auth | `jsonwebtoken` — 7-day JWT, `bcryptjs` — 10 salt rounds |
| Email | Nodemailer (SMTP); falls back to `console.log` when `SMTP_HOST` not set |
| Testing — backend | Jest 29 + Supertest; `resetMocks: true` in jest config |
| Testing — frontend | Vitest + React Testing Library + jsdom |
| Infrastructure | AWS EC2 t3.micro + RDS MySQL db.t3.micro; Nginx + PM2 |

---

## Directory layout

```
server/                       CommonJS Express API
  config/
    database.js               mysql2 pool — import this everywhere you need DB
    init-db.js                Idempotent schema runner + migrations (safe to re-run)
  middleware/
    authenticate.js           Verifies Bearer JWT → sets req.user {id, username, isAdmin}
    requireAdmin.js           Checks req.user.isAdmin; 403 if not
    errorHandler.js           Global Express error handler
  repositories/               Raw SQL only. One file per domain. No business logic.
    booksRepository.js
    shelvesRepository.js
    usersRepository.js
    buddiesRepository.js
    resetTokensRepository.js
  services/                   Business logic. Calls repositories. Throws {status, message} errors.
    authService.js
    shelfService.js           Book save/delete (core shelf-assignment logic)
    shelvesService.js         Multi-shelf CRUD
    buddiesService.js
    accountService.js
    adminService.js
    emailService.js
    openLibraryService.js
  controllers/                HTTP layer. Validates input → calls service → sends response.
    authController.js
    booksController.js
    shelvesController.js
    buddiesController.js
    usersController.js
    accountController.js
    adminController.js
  routes/                     Binds paths to controllers + middleware
    auth.js, books.js, shelves.js, buddies.js, users.js, account.js, admin.js
  index.js                    Express app (listen only when require.main === module)
  __tests__/
    helpers.js                Token factory (loads .env for JWT_SECRET)
    *.test.js                 One file per domain

client/src/
  context/
    AuthContext.jsx           login/logout; user + token stored as sb_user / sb_token
  services/
    api.js                    Base axios instance — attaches Bearer token automatically
    authService.js
    bookService.js
    shelvesService.js
    buddiesService.js
    accountService.js
    adminService.js
  hooks/
    useSearch.js
    usePopular.js
    useShelves.js
    useShelf.js
    useBuddies.js
  components/
    BookCard.jsx              Search result card + shelf picker dropdown
    ShelfCard.jsx             Saved-book card (edit controls + add-to-other-shelf)
    ProtectedRoute.jsx
    Footer.jsx
  pages/
    LandingPage.jsx
    LoginPage.jsx             Sign in + register + account recovery panel
    DashboardPage.jsx         Activity feed + buddy avatars
    SearchPage.jsx
    ShelvesPage.jsx           Full shelf management UI
    ShelfPage.jsx
    BuddiesPage.jsx
    BuddyShelvesPage.jsx      Read-only view of a buddy's shelves
    AccountPage.jsx           Stats + delete account
    ResetPasswordPage.jsx
    AdminPage.jsx
    AboutPage.jsx
  tests/
    setup.js                  RTL jest-dom matchers
    components/               Component tests
    pages/                    Page tests
    hooks/                    Hook tests
```

---

## Backend patterns

### Layer flow

```
HTTP request
  → route (middleware chain)
    → controller (validate input, call service, send response)
      → service (business logic, throw errors with {status})
        → repository (SQL query, return rows)
```

Never skip a layer. Controllers must not write SQL. Services must not call `res.json`.

### Error handling in services

```javascript
throw Object.assign(new Error('Shelf not found'), { status: 404 });
```

Controllers catch these and respond with the given status. Unhandled errors fall to `errorHandler.js` → 500.

### Ownership and privacy

Unowned resources return **404** (not 403) to avoid leaking existence. Private shelf content is never returned regardless of requester.

### Auth middleware

```javascript
// authenticate.js — sets req.user = { id, username, isAdmin }
// requireAdmin.js — checks req.user.isAdmin; 403 if false

// Typical authenticated route:
router.get('/', authenticate, ctrl.list);

// Admin route:
router.get('/users', authenticate, requireAdmin, ctrl.listUsers);
```

`isAdmin` lives in the JWT payload. Granting admin requires the user to log out and back in.

### Mocking the database in tests

```javascript
jest.mock('../config/database', () => ({ query: jest.fn() }));
const pool = require('../config/database');

pool.query.mockResolvedValueOnce([[row1, row2]]);  // SELECT
pool.query.mockResolvedValueOnce([{ insertId: 5 }]);  // INSERT
pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);  // UPDATE/DELETE
```

`resetMocks: true` in `server/package.json` jest config clears queued return values between tests.

Mock order must match the order the service actually calls `pool.query`. Trace the service function carefully.

---

## Frontend patterns

### API calls

```javascript
// All calls go through services/api.js (base axios instance)
import api from './api';
export const listShelves = () => api.get('/shelves').then(r => r.data);
```

### Hooks

```javascript
const { shelves, loading, error, createShelf, updateShelf, deleteShelf, reload } = useShelves();
```

Hooks manage loading/error state and expose mutations. Pages consume hooks; they don't call services directly.

### Mocking in Vitest

```javascript
vi.mock('../../services/shelvesService', () => ({
  listShelves: vi.fn(),
  createShelf: vi.fn(),
}));

const { listShelves } = await import('../../services/shelvesService');
listShelves.mockResolvedValueOnce([shelf1, shelf2]);
```

### Label-input association (accessibility + RTL)

Always pair `htmlFor` on labels with `id` on inputs. Required for `getByLabelText` to work.

```jsx
<label htmlFor="login-username">Username</label>
<input id="login-username" ... />
```

### Button types

Always set `type="button"` on non-submit buttons (tabs, toggles). HTML default is `type="submit"`, which can cause unexpected form submissions.

---

## Database schema

```sql
users (
  id INT PK AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP
)

books (
  id INT PK AUTO_INCREMENT,
  user_id INT NOT NULL → users(id) CASCADE,
  external_id VARCHAR(255),              -- Open Library key e.g. /works/OL1W
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  publication_year INT,
  cover_url TEXT,
  pages INT,
  created_at TIMESTAMP,
  UNIQUE (user_id, external_id)
)

shelves (
  id INT PK AUTO_INCREMENT,
  user_id INT NOT NULL → users(id) CASCADE,
  name VARCHAR(100) NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP
)

book_shelves (                           -- join table: a book can be on many shelves
  book_id INT → books(id) CASCADE,
  shelf_id INT → shelves(id) CASCADE,
  added_at TIMESTAMP,
  PRIMARY KEY (book_id, shelf_id)
)

friendships (
  id INT PK AUTO_INCREMENT,
  requester_id INT → users(id) CASCADE,
  receiver_id INT → users(id) CASCADE,
  status ENUM('pending','accepted','declined') DEFAULT 'pending',
  created_at TIMESTAMP,
  UNIQUE (requester_id, receiver_id)
)

password_reset_tokens (
  id INT PK AUTO_INCREMENT,
  user_id INT → users(id) CASCADE,
  token CHAR(64) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP
)
```

All foreign keys use `ON DELETE CASCADE`. Migrations in `init-db.js` check `INFORMATION_SCHEMA` before altering, so every migration is safe to re-run.

---

## Running locally

```powershell
# Both servers at once
dev.bat

# Or separately:
cd server && npm run dev       # Express on :3001
cd client && npm run dev      # Vite on :5173
```

## Running tests

```powershell
cd server && npm test          # Jest — 87 tests
cd client && npx vitest run   # Vitest — 40 tests
```
