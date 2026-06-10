# SecondHand Books

A full-stack web app for searching books via the Open Library API and saving them to a personal shelf.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/mysql/) 8.0 or higher (must be running locally)

## Local Setup

### 1. Install dependencies

```
cd server && npm install && cd ../client && npm install && cd ..
```

### 2. Configure the database

Copy the example env file and fill in your MySQL credentials:

```
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
```

### 3. Initialize the database

This creates the `secondhand_books` database and the `books` table if they don't exist:

```
cd server && npm run db:init && cd ..
```

### 4. Start the app

Double-click `dev.bat` in the project root, or run it from a terminal:

```
dev.bat
```

This opens two terminal windows — one for the backend, one for the frontend — with a short delay so the server is ready first.

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:3001  |

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Features

- **Search** books by title via the Open Library API
- **Save** books to your personal shelf (duplicates are prevented)
- **View shelf** with sort by date added or title
- **Remove** books from your shelf (with confirmation)

## Project Structure

```
Secondhand-Books/
├── dev.bat                   # Windows dev launcher
├── server/                   # Express API (Node.js)
│   ├── config/
│   │   ├── database.js       # mysql2 connection pool
│   │   └── init-db.js        # one-time DB + table setup
│   ├── controllers/          # HTTP request/response only
│   ├── services/             # business logic
│   │   ├── openLibraryService.js
│   │   └── shelfService.js
│   ├── repositories/         # database access
│   ├── routes/
│   ├── middleware/
│   └── index.js
└── client/                   # React + Vite frontend
    └── src/
        ├── components/       # BookCard, ShelfCard
        ├── pages/            # SearchPage, ShelfPage
        ├── hooks/            # useSearch, useShelf
        ├── services/         # bookService (axios)
        └── utils/
```

## API Reference

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| GET    | /api/books/search?q= | Search Open Library by title       |
| GET    | /api/books           | List saved shelf (sort=date\|title) |
| POST   | /api/books           | Save a book to shelf               |
| DELETE | /api/books/:id       | Remove a book from shelf           |

## Troubleshooting

**"Failed to initialize database: Server requests authentication using unknown plugin auth_gssapi_client"**

`mysql2` doesn't support the GSSAPI auth plugin. You need to switch the root user to `mysql_native_password`. If you know your root password, connect and run:

**MySQL 8+:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

**MariaDB:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('your_password');
FLUSH PRIVILEGES;
```

Then update `server/.env` with that password and re-run `dev.bat`.

---

**I don't know my root password (Windows)**

You can reset it by starting the database in no-auth mode. Open a Command Prompt as Administrator.

**1 — Find your mysqld path:**
```
where mysqld
```
It will print something like `C:\Program Files\MariaDB 11.x\bin\mysqld.exe`.

**2 — Stop the database service:**

Press Win+R, type `services.msc`, find **MariaDB** (or MySQL), right-click → **Stop**.

**3 — Start mysqld with no auth (in your admin Command Prompt):**
```
"C:\Program Files\MariaDB 11.x\bin\mysqld.exe" --skip-grant-tables
```
Leave this window running — no prompt is returned, that's normal. The `feedback plugin` error that may appear is harmless.

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
> Use `IDENTIFIED VIA` on MariaDB. On MySQL 8+ use `IDENTIFIED WITH mysql_native_password BY ''` instead.

**6 — Restore normal operation:**

Go back to the admin Command Prompt running mysqld and press **Ctrl+C**. Then go to `services.msc` and **Start** the MariaDB/MySQL service again.

**7 — Update `server/.env`:**
```
DB_PASSWORD=
```
Run `dev.bat` — database initialization should now succeed.

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
The backend isn't running. Make sure the backend terminal window opened by `dev.bat` shows `Server running on port 3001`.

**"Could not load your shelf."**
The backend can't reach MySQL. Check that MySQL is running and that your `server/.env` credentials are correct.

**Port already in use**
Change the backend port in `server/.env` (`PORT=3002`) and update the proxy target in `client/vite.config.js` to match.
