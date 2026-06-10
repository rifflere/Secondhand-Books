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

**"Search failed. Is the backend running?"**
The backend isn't running. Make sure the backend terminal window opened by `dev.bat` shows `Server running on port 3001`.

**"Could not load your shelf."**
The backend can't reach MySQL. Check that MySQL is running and that your `server/.env` credentials are correct. Re-run `npm run db:init` in `server/` if the database hasn't been created yet.

**Port already in use**
Change the backend port in `server/.env` (`PORT=3002`) and update the proxy target in `client/vite.config.js` to match.
