# Secondhand Books

A full-stack web app for tracking books you want to read, have read, or just love. Search the Open Library catalogue, save books to named shelves, connect with reading buddies, and manage your account.

**Live at:** [secondhand-books.ddns.net](http://secondhand-books.ddns.net)

![Dashboard](docs/screenshots/dashboard.png)

---

## Features

- **Search** the Open Library catalogue by title; browse what's most-saved across all readers
- **Named shelves** — create as many shelves as you like, toggle them public or private, rename and delete them
- **Save to a specific shelf** directly from search results
- **Book Buddies** — find other users, send buddy requests, and browse each other's public shelves
- **Activity feed** — see what your buddies have been saving lately
- **Account recovery** — forgot your username or password? Get help via email from the login page
- **Account page** — view your stats, and delete your account if you ever need to

---

## User Guide

### Creating an account

Go to [secondhand-books.ddns.net](http://secondhand-books.ddns.net) and click **Sign In** in the top-right, then switch to the **Create Account** tab.

You'll need:
- A **username** (shown publicly to buddies)
- An **email address** (used only for account recovery — never shown to other users)
- A **password** (at least 6 characters)

![Create account form](docs/screenshots/register.png)

---

### Searching for books

Click **Search** in the nav bar. Type a title and hit Search, or browse the **What's Popular** section to see what other readers are saving.

![Search results](docs/screenshots/search.png)

Each result card shows the cover, author, year, page count, and how many readers have saved it. Click **Save to Shelf** to pick which of your shelves to add it to.

---

### Managing your shelves

Click **My Shelves** in the nav bar.

![Shelves page](docs/screenshots/shelves.png)

**Tabs across the top** — each tab is one of your shelves. The number in brackets is the book count.

**Creating a shelf** — type a name into the **+ New Shelf** field at the end of the tab row and press Enter.

**Renaming** — click the **Rename** button in the shelf toolbar. Type the new name and press Enter or click Save.

**Public / Private toggle** — click **Public** or **Private** in the toolbar to control who can see the shelf. Private shelves are visible only to you — they don't appear in buddy views, the activity feed, or the popular books list.

**Deleting a shelf** — click **Delete** in the toolbar. A warning will show you how many books are on the shelf. Books that exist only on the deleted shelf are permanently removed; books that also live on another shelf are kept.

**Adding a book to another shelf** — on any book card on your shelf, click **+ Shelf** to see a dropdown of your other shelves and add the book there too.

**Removing a book** — click the **×** on a book card. If the book is on other shelves it stays there; if it was only on this shelf it's removed from your library entirely.

**Sorting** — use the sort controls above the book grid to sort by Date Added or Title, ascending or descending.

---

### Book Buddies

Click **Buddies** in the nav bar.

![Buddies page](docs/screenshots/buddies.png)

**Finding someone** — type a username into the search box. Results show the relationship status alongside each user (no relationship, request sent, request received, or already buddies).

**Sending a request** — click **Add Buddy** on a search result. They'll see a badge on their Buddies nav link when the request arrives.

**Accepting / declining** — incoming requests appear at the top of the Buddies page. Click **Accept** or **Decline**.

**Viewing a buddy's shelves** — click a buddy's name or avatar to open their shelf view. You'll see all their public shelves and the books on them (read-only).

**Removing a buddy** — click **Remove** on any accepted buddy to unfriend them.

---

### Activity feed

The **Dashboard** (home page when signed in) shows a feed of books your buddies have recently added to their public shelves, plus a row of buddy avatars linking to their shelves.

![Dashboard feed](docs/screenshots/dashboard.png)

---

### Account page

Click your **username** in the nav bar to open your account page.

![Account page](docs/screenshots/account.png)

Here you can see:
- Your username and the date you joined
- Stats: total books saved, shelves created, and buddies
- A **Delete Account** option — this permanently removes your account, all your books and shelves, and disconnects you from all buddy lists. You'll be asked to type your username to confirm before anything is deleted.

---

### Recovering your account

On the Sign In page, click **Forgot username or password?** to expand the recovery panel.

![Account recovery](docs/screenshots/recovery.png)

- **Get my username** — enter your email and we'll send your username to that address
- **Reset my password** — enter your username and email; if they match we'll send a reset link (valid for 1 hour)

> Recovery emails are sent to the address you registered with. The link in the email takes you to a page where you can set a new password.

---

## Agentic Development

This project includes a documentation harness and a set of Claude Code slash commands for building features with AI assistance. If you're new to agentic coding, read this section first.

### How it works

Feature development follows a five-stage loop:

```
/spec  →  /critique  →  /plan  →  /build  →  /validate  →  /ship
```

`/critique` can be used at any stage — after a spec, after a plan, or against recent code changes. It's intentionally adversarial: it looks for scope creep, constitution violations, privacy leaks, missing failure modes, and weak tests.

Each stage produces a file that the next stage reads. Nothing is thrown away — the spec, plan, and test results all live in `docs/features/`.

### The docs folder

```
docs/
  product.md          What the product is, who it's for, what's out of scope
  tech.md             Stack, directory layout, backend/frontend patterns, DB schema
  constitution.md     Hard constraints — rules that must never be broken
  features/
    0001-auth/        One folder per feature, numbered in order
      spec.md         What to build (behavior, data model, API, tests to write)
      plan.md         How to build it (step-by-step, file by file)
    0002-books/
    0003-shelves/
    ...
```

Start a new session by pointing Claude at the relevant docs: "Read docs/product.md, docs/tech.md, and docs/features/0003-shelves/spec.md, then help me..."

### Slash commands

These commands live in `.claude/commands/` and are available in Claude Code when you type `/`.

| Command | What it does |
|---------|-------------|
| `/spec [idea]` | Asks you clarifying questions and writes a spec to `docs/features/NNNN-name/spec.md` |
| `/plan [NNNN-name]` | Reads the spec and writes a step-by-step implementation plan |
| `/build [NNNN-name]` | Implements the plan, running tests incrementally as it goes |
| `/validate` | Runs all backend + frontend tests and reports pass/fail |
| `/ship [message]` | Runs tests; if green, creates a conventional commit |
| `/critique [NNNN-name]` | Adversarial review — pushes back on specs, plans, or recent code before you commit to them |

### Starting a new feature — step by step

**1. Discuss and spec**
```
/spec I want to add reading lists — a way to tag books as "want to read" vs "have read"
```
Claude will ask questions, then write `docs/features/0007-reading-lists/spec.md`. Review and edit the file directly if anything's off.

**2. Plan**
```
/plan 0007-reading-lists
```
Claude reads the spec + `docs/tech.md` + relevant existing files, then writes a step-by-step plan to `docs/features/0007-reading-lists/plan.md`. Read the plan before proceeding — this is your last cheap chance to catch scope creep.

**3. Build**
```
/build 0007-reading-lists
```
Claude implements the plan layer by layer (DB → repo → service → controller → route → frontend → tests), running tests after each layer.

**4. Validate**
```
/validate
```
Runs both test suites and shows a clean pass/fail summary.

**5. Commit**
```
/ship feat: add reading list status to books
```
Runs tests one more time, stages the changes, and creates a conventional commit. Does not push.

### Tips for working with Claude

- **Share context explicitly.** At the start of a new session, say: "Read docs/product.md and docs/tech.md, then we'll work on X." Claude doesn't remember previous sessions.
- **Review specs and plans before building.** The spec is cheap to change; the plan is slightly less cheap; the code is expensive.
- **One feature at a time.** Keep feature folders small. If a spec is getting complex, split it.
- **Trust the tests.** `/build` won't mark a step done if the tests fail. Don't skip this.
- **The constitution is the safety net.** If Claude proposes something that would violate `docs/constitution.md` (e.g., skipping a layer, or using `is_default` as a privacy gate), point to the relevant rule.

### Running tests manually

```powershell
cd server && npm test           # Jest — backend, 87 tests
cd client && npx vitest run    # Vitest — frontend, 40 tests
```

---

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/mysql/) 8.0 or MariaDB (must be running locally)

### 1. Install dependencies

```powershell
cd server && npm install && cd ../client && npm install && cd ..
```

### 2. Configure the database

```powershell
copy server\.env.example server\.env
```

Edit `server/.env`:

```
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=secondhand_books
JWT_SECRET=generate_a_long_random_string

# Used in password-reset email links — keep as localhost for dev
APP_URL=http://localhost:5173
```

Generate a JWT secret:
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Initialize the database

Creates all tables and runs any pending migrations. Safe to re-run.

```powershell
cd server && npm run db:init && cd ..
```

### 4. Start the app

Double-click `dev.bat` or run it from a terminal:

```powershell
dev.bat
```

Opens two terminals — backend on port 3001, frontend on port 5173.

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:3001  |

---

## Project Structure

```
Secondhand-Books/
├── dev.bat                           # Windows dev launcher
├── deploy/
│   ├── upload.ps1                    # Builds frontend + SCPs everything to EC2
│   ├── server-setup.sh               # One-time EC2 setup reference
│   └── nginx.conf                    # Nginx config (static frontend + API proxy)
├── terraform/                        # AWS infrastructure (EC2 + RDS)
├── server/                           # Express API — CommonJS, MVC pattern
│   ├── config/
│   │   ├── database.js               # mysql2 connection pool
│   │   └── init-db.js                # Idempotent schema setup + migrations
│   ├── middleware/
│   │   ├── authenticate.js           # JWT verification → req.user
│   │   ├── requireAdmin.js           # Admin-only gate (checks req.user.isAdmin)
│   │   └── errorHandler.js
│   ├── repositories/                 # Raw SQL — one file per domain
│   │   ├── usersRepository.js
│   │   ├── booksRepository.js
│   │   ├── shelvesRepository.js
│   │   ├── buddiesRepository.js
│   │   └── resetTokensRepository.js
│   ├── services/                     # Business logic
│   │   ├── authService.js
│   │   ├── shelfService.js           # Book save/delete (core shelf logic)
│   │   ├── shelvesService.js         # Multi-shelf CRUD
│   │   ├── buddiesService.js
│   │   ├── adminService.js
│   │   ├── accountService.js
│   │   ├── emailService.js           # Nodemailer (console.log fallback in dev)
│   │   └── openLibraryService.js
│   ├── controllers/                  # HTTP layer: validate → call service → respond
│   │   ├── authController.js
│   │   ├── booksController.js
│   │   ├── shelvesController.js
│   │   ├── buddiesController.js
│   │   ├── usersController.js
│   │   ├── accountController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── shelves.js
│   │   ├── buddies.js
│   │   ├── users.js
│   │   ├── account.js
│   │   └── admin.js
│   └── index.js
└── client/                           # React + Vite — ES modules
    └── src/
        ├── context/
        │   └── AuthContext.jsx       # user + token in localStorage
        ├── components/
        │   ├── BookCard.jsx          # Search result card with shelf picker
        │   ├── ShelfCard.jsx         # Saved book card with add-to-shelf dropdown
        │   ├── ReadOnlyShelfCard.jsx # Buddy shelf view (no edit controls)
        │   ├── ProtectedRoute.jsx
        │   └── Footer.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx         # Sign in + register + account recovery
        │   ├── DashboardPage.jsx     # Activity feed + buddy avatars
        │   ├── SearchPage.jsx
        │   ├── ShelvesPage.jsx       # Full shelf management UI
        │   ├── BuddiesPage.jsx       # Search users, manage requests + buddies
        │   ├── BuddyShelvesPage.jsx  # Read-only view of a buddy's shelves
        │   ├── AccountPage.jsx       # Stats + delete account
        │   ├── ResetPasswordPage.jsx # Password reset via emailed token
        │   ├── AdminPage.jsx         # User list + public shelves (admin only)
        │   └── AboutPage.jsx
        ├── hooks/
        │   ├── useSearch.js
        │   ├── usePopular.js
        │   ├── useShelves.js
        │   └── useBuddies.js
        └── services/                 # Axios wrappers — one file per domain
            ├── api.js                # Base axios instance with auth interceptor
            ├── authService.js
            ├── bookService.js
            ├── shelvesService.js
            ├── buddiesService.js
            ├── accountService.js
            └── adminService.js
```

---

## API Reference

### Auth (`/api/auth`)

| Method | Path                     | Auth | Description                                |
|--------|--------------------------|------|--------------------------------------------|
| POST   | `/register`              | —    | Create account (username, email, password) |
| POST   | `/login`                 | —    | Sign in — returns JWT + user object        |
| POST   | `/recover`               | —    | Email username or password-reset link      |
| GET    | `/validate-token/:token` | —    | Check if a reset token is still valid      |
| POST   | `/reset-password`        | —    | Set new password using a reset token       |

### Books (`/api/books`)

| Method | Path         | Auth | Description                            |
|--------|--------------|------|----------------------------------------|
| GET    | `/popular`   | —    | Most-saved books (public shelves only) |
| GET    | `/search?q=` | —    | Search Open Library by title           |
| GET    | `/`          | ✓    | List user's books (`sort`, `dir`)      |
| POST   | `/`          | ✓    | Save a book (optionally to `shelfId`)  |
| DELETE | `/:id`       | ✓    | Remove a book                          |

### Shelves (`/api/shelves`)

| Method | Path                  | Auth | Description                        |
|--------|-----------------------|------|------------------------------------|
| GET    | `/`                   | ✓    | All shelves for current user       |
| POST   | `/`                   | ✓    | Create a shelf                     |
| PATCH  | `/:id`                | ✓    | Rename or toggle public/private    |
| DELETE | `/:id`                | ✓    | Delete shelf + orphan book cleanup |
| GET    | `/:id/books`          | ✓    | Books on a shelf                   |
| POST   | `/:id/books`          | ✓    | Add a book to a shelf              |
| DELETE | `/:id/books/:bookId`  | ✓    | Remove a book from a shelf         |

### Buddies (`/api/buddies`)

| Method | Path                  | Auth | Description                      |
|--------|-----------------------|------|----------------------------------|
| GET    | `/search?q=`          | ✓    | Search users by username         |
| GET    | `/feed`               | ✓    | Recent activity from buddies     |
| GET    | `/requests/incoming`  | ✓    | Pending requests received        |
| GET    | `/requests/outgoing`  | ✓    | Pending requests sent            |
| GET    | `/`                   | ✓    | Accepted buddies                 |
| POST   | `/request`            | ✓    | Send a buddy request             |
| PATCH  | `/:id`                | ✓    | Accept or decline a request      |
| DELETE | `/:id`                | ✓    | Remove a buddy                   |

### Users (`/api/users`)

| Method | Path                                | Auth | Description                     |
|--------|-------------------------------------|------|---------------------------------|
| GET    | `/:username/shelves`                | ✓    | A buddy's public shelves        |
| GET    | `/:username/shelves/:shelfId/books` | ✓    | Books on a buddy's public shelf |

### Account (`/api/account`)

| Method | Path     | Auth | Description                           |
|--------|----------|------|---------------------------------------|
| GET    | `/stats` | ✓    | Books, shelves, buddies count + dates |
| DELETE | `/`      | ✓    | Delete account (cascades everything)  |

### Admin (`/api/admin`) — admin token required

| Method | Path                  | Auth        | Description                  |
|--------|-----------------------|-------------|------------------------------|
| GET    | `/users`              | ✓ + admin   | All users with stats         |
| GET    | `/shelves`            | ✓ + admin   | All public shelves           |
| PATCH  | `/users/:id/admin`    | ✓ + admin   | Grant or revoke admin        |
| DELETE | `/users/:id`          | ✓ + admin   | Delete a user                |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions (Terraform setup, first-time EC2 config, tear-down).

**Quick redeploy after code changes:**

```powershell
.\deploy\upload.ps1 -IP <EC2_IP>
```

Then SSH in and run on the server:

```bash
cd /var/www/secondhand-books/server
npm install --omit=dev          # only when package.json changed
npm run db:init                 # only when init-db.js changed (safe to re-run)
pm2 restart secondhand-books
sudo chmod -R o+rX /var/www/secondhand-books/client/dist
```

---

## Troubleshooting

**500 Internal Server Error after deploy**
nginx lost read permissions on the dist folder. Run:
```bash
sudo chmod -R o+rX /var/www/secondhand-books/client/dist
```
Confirm with: `sudo tail /var/log/nginx/error.log` — look for `Permission denied`.

**"Email is required" when registering**
The register form now requires an email address for account recovery. It's never shown to other users or used for sign-in.

**Recovery emails not arriving**
Without SMTP configured, emails print to the server console (`pm2 logs secondhand-books`). The reset link in the log is fully functional — copy and open it directly.

**"Failed to initialize database: unknown plugin auth_gssapi_client"**

Switch the MySQL root user to `mysql_native_password`:

*MySQL 8+:*
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```
*MariaDB:*
```sql
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('your_password');
FLUSH PRIVILEGES;
```
Update `server/.env` and re-run `dev.bat`.

**I don't know my root password (Windows)**

Reset it in no-auth mode. Open Command Prompt as Administrator.

1. `where mysqld` — note the path
2. Stop the database service: Win+R → `services.msc` → MariaDB/MySQL → Stop
3. Start with no auth: `"C:\...\mysqld.exe" --skip-grant-tables` (leave running)
4. Connect: `"C:\...\mysql.exe" -u root`
5. Reset:
```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('');
FLUSH PRIVILEGES;
exit
```
6. Ctrl+C the mysqld window, restart the service, update `server/.env` with `DB_PASSWORD=`.

**I'd rather not change the root user**
```sql
CREATE USER 'books_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'choose_a_password';
GRANT ALL PRIVILEGES ON secondhand_books.* TO 'books_user'@'localhost';
FLUSH PRIVILEGES;
```
Then set `DB_USER=books_user` and `DB_PASSWORD=choose_a_password` in `server/.env`.

**"Search failed. Is the backend running?"**
The backend isn't running. Make sure the backend terminal opened by `dev.bat` shows `Server running on port 3001`.

**"Could not load your shelf."**
The backend can't reach MySQL. Check that MySQL is running and `server/.env` credentials are correct.

**Port already in use**
Change `PORT=3002` in `server/.env` and update the proxy target in `client/vite.config.js` to match.
