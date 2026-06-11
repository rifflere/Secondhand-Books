# Secondhand Books

A full-stack web app for searching books via the Open Library API, saving them to named shelves, connecting with reading buddies, and managing your account.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/mysql/) 8.0 or MariaDB (must be running locally)

## Local Setup

### 1. Install dependencies

```powershell
cd server && npm install && cd ../client && npm install && cd ..
```

### 2. Configure the database

```powershell
copy server\.env.example server\.env
```

Edit `server/.env` with your MySQL credentials and a JWT secret:

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

# Optional: real SMTP for email sending (see .env.example for all fields)
# Without SMTP, recovery emails print to the server console instead.
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

Opens two terminals — one for the backend (port 3001), one for the frontend (port 5173).

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:3001  |

---

## Features

- **Search** books by title via the Open Library API; browse what's popular across all readers
- **Named shelves** — create multiple shelves per account, toggle public/private, rename, delete with orphan-book cleanup
- **Save to shelf** — pick which shelf directly from the search results
- **Book Buddies** — find users by username, send/accept buddy requests; accepted buddies can view each other's public shelves
- **Activity feed** — see what books your buddies have saved recently
- **Account management** — view stats (books, shelves, buddies), joined date, delete account with confirmation
- **Account recovery** — forgot username (email lookup) or forgot password (email reset link) from the login page

---

## Project Structure

```
Secondhand-Books/
├── dev.bat                       # Windows dev launcher (opens two terminals)
├── server/                       # Express API (Node.js, CommonJS)
│   ├── config/
│   │   ├── database.js           # mysql2 connection pool
│   │   └── init-db.js            # idempotent DB + table setup / migrations
│   ├── controllers/              # HTTP layer only (validate → service → respond)
│   │   ├── authController.js
│   │   ├── booksController.js
│   │   ├── shelvesController.js
│   │   ├── buddiesController.js
│   │   ├── usersController.js
│   │   └── accountController.js
│   ├── services/                 # Business logic
│   │   ├── authService.js
│   │   ├── shelfService.js       # book save/delete (main shelf logic)
│   │   ├── shelvesService.js     # multi-shelf CRUD
│   │   ├── buddiesService.js
│   │   ├── emailService.js       # nodemailer (falls back to console.log in dev)
│   │   ├── accountService.js
│   │   └── openLibraryService.js
│   ├── repositories/             # DB access only (raw SQL)
│   │   ├── usersRepository.js
│   │   ├── booksRepository.js
│   │   ├── shelvesRepository.js
│   │   ├── buddiesRepository.js
│   │   └── resetTokensRepository.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── shelves.js
│   │   ├── buddies.js
│   │   ├── users.js
│   │   └── account.js
│   ├── middleware/
│   │   ├── authenticate.js       # JWT verification → req.user
│   │   └── errorHandler.js
│   └── index.js
└── client/                       # React + Vite (ES modules)
    └── src/
        ├── components/           # BookCard, ShelfCard, ReadOnlyShelfCard, etc.
        ├── pages/                # One component per route
        ├── hooks/                # useSearch, usePopular, useShelves, useBuddies
        ├── services/             # axios wrappers (api.js + per-domain files)
        └── context/
            └── AuthContext.jsx   # user + token stored in localStorage
```

---

## API Reference

### Auth (`/api/auth`)

| Method | Path                        | Auth | Description                                  |
|--------|-----------------------------|------|----------------------------------------------|
| POST   | `/register`                 | —    | Create account (username, email, password)   |
| POST   | `/login`                    | —    | Sign in (username + password)                |
| POST   | `/recover`                  | —    | Email username or password-reset link        |
| GET    | `/validate-token/:token`    | —    | Check if a reset token is still valid        |
| POST   | `/reset-password`           | —    | Set new password using a valid reset token   |

### Books (`/api/books`)

| Method | Path           | Auth | Description                           |
|--------|----------------|------|---------------------------------------|
| GET    | `/popular`     | —    | Most-saved books across all users     |
| GET    | `/search?q=`   | —    | Search Open Library by title          |
| GET    | `/`            | ✓    | List user's books (`sort`, `dir`)     |
| POST   | `/`            | ✓    | Save a book (optionally to `shelfId`) |
| DELETE | `/:id`         | ✓    | Remove a book                         |

### Shelves (`/api/shelves`)

| Method | Path                    | Auth | Description                       |
|--------|-------------------------|------|-----------------------------------|
| GET    | `/`                     | ✓    | List all shelves for current user |
| POST   | `/`                     | ✓    | Create a shelf                    |
| PATCH  | `/:id`                  | ✓    | Rename or toggle public/private   |
| DELETE | `/:id`                  | ✓    | Delete shelf + orphan books       |
| GET    | `/:id/books`            | ✓    | List books on a shelf             |
| POST   | `/:id/books`            | ✓    | Add a book to a shelf             |
| DELETE | `/:id/books/:bookId`    | ✓    | Remove a book from a shelf        |

### Buddies (`/api/buddies`)

| Method | Path                    | Auth | Description                         |
|--------|-------------------------|------|-------------------------------------|
| GET    | `/search?q=`            | ✓    | Search users by username            |
| GET    | `/feed`                 | ✓    | Recent activity from buddies        |
| GET    | `/requests/incoming`    | ✓    | Pending requests received           |
| GET    | `/requests/outgoing`    | ✓    | Pending requests sent               |
| GET    | `/`                     | ✓    | List accepted buddies               |
| POST   | `/request`              | ✓    | Send a buddy request                |
| PATCH  | `/:id`                  | ✓    | Accept or decline a request         |
| DELETE | `/:id`                  | ✓    | Remove a buddy                      |

### Users (`/api/users`)

| Method | Path                                  | Auth | Description                        |
|--------|---------------------------------------|------|------------------------------------|
| GET    | `/:username/shelves`                  | ✓    | Public shelves for a buddy         |
| GET    | `/:username/shelves/:shelfId/books`   | ✓    | Books on a buddy's public shelf    |

### Account (`/api/account`)

| Method | Path      | Auth | Description                                  |
|--------|-----------|------|----------------------------------------------|
| GET    | `/stats`  | ✓    | Books, shelves, buddies count + join date    |
| DELETE | `/`       | ✓    | Delete account (cascades everything)         |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions. The app runs on AWS Free Tier (EC2 + RDS) managed by Terraform.

Quick redeploy after code changes:

```powershell
# Upload code
.\deploy\upload.ps1 -IP <EC2_IP>

# SSH in, then:
cd /var/www/secondhand-books/server
npm install --omit=dev   # run when package.json changed
npm run db:init          # run when init-db.js changed (always safe to re-run)
pm2 restart secondhand-books
```

---

## Troubleshooting

**"Email is required" when registering**  
The register form now requires an email address for account recovery. It's only used for password resets — you never sign in with it.

**Recovery emails not arriving**  
Without SMTP configured, emails print to the server console (`pm2 logs secondhand-books` on the server, or the backend terminal locally). The reset link in the log is fully functional — you can copy and open it.

**"Failed to initialize database: Server requests authentication using unknown plugin auth_gssapi_client"**

`mysql2` doesn't support the GSSAPI auth plugin. Switch the root user to `mysql_native_password`.

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

Then update `server/.env` with that password and re-run `dev.bat`.

---

**I don't know my root password (Windows)**

Reset it by starting the database in no-auth mode. Open a Command Prompt as Administrator.

**1 — Find your mysqld path:**
```
where mysqld
```
It will print something like `C:\Program Files\MariaDB 11.x\bin\mysqld.exe`.

**2 — Stop the database service:**

Press Win+R → `services.msc` → find MariaDB/MySQL → right-click → Stop.

**3 — Start mysqld with no auth (admin Command Prompt):**
```
"C:\Program Files\MariaDB 11.x\bin\mysqld.exe" --skip-grant-tables
```
Leave this window running.

**4 — Connect in a second Command Prompt:**
```
"C:\Program Files\MariaDB 11.x\bin\mysql.exe" -u root
```

**5 — Reset the password:**
```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('');
FLUSH PRIVILEGES;
exit
```

**6 — Restore normal operation:**

Ctrl+C the mysqld window, then start the service again in `services.msc`.

**7 — Update `server/.env`:** set `DB_PASSWORD=` (empty) and re-run `dev.bat`.

---

**I'd rather not change the root user**

Create a dedicated app user instead:
```sql
CREATE USER 'books_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'choose_a_password';
GRANT ALL PRIVILEGES ON secondhand_books.* TO 'books_user'@'localhost';
FLUSH PRIVILEGES;
```
Then update `server/.env`: `DB_USER=books_user` and `DB_PASSWORD=choose_a_password`.

---

**"Search failed. Is the backend running?"**  
Make sure the backend terminal opened by `dev.bat` shows `Server running on port 3001`.

**"Could not load your shelf."**  
The backend can't reach MySQL. Check that MySQL is running and your `server/.env` credentials are correct.

**Port already in use**  
Change the backend port in `server/.env` (`PORT=3002`) and update the proxy target in `client/vite.config.js` to match.
