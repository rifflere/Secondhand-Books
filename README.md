# SecondHand Books

A full-stack web app for searching books via the Open Library API and saving them to a personal shelf.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

## Local Setup

**1. Clone the repo and install dependencies**

```bash
git clone <repo-url>
cd Secondhand-Books
cd server && npm install && cd ../client && npm install && cd ..
```

**2. Start the app**

Double-click `dev.bat` in the project root, or run it from a terminal:

```
dev.bat
```

This opens two terminal windows — one for the backend, one for the frontend — with a short delay between them so the server is ready first.

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:3001      |

**3. Open your browser**

Navigate to [http://localhost:5173](http://localhost:5173). The app will load with a search for "War and Peace" to confirm everything is connected.

## Project Structure

```
Secondhand-Books/
├── dev.bat              # Windows dev launcher (starts backend then frontend)
├── server/              # Express API
│   ├── routes/
│   ├── controllers/
│   ├── services/        # Open Library integration + business logic
│   ├── middleware/
│   └── index.js
└── client/              # React + Vite frontend
    └── src/
        ├── components/
        ├── pages/
        └── services/    # Axios API calls
```

## API

| Method | Endpoint               | Description               |
|--------|------------------------|---------------------------|
| GET    | /api/books/search?q=   | Search books by title     |

## Troubleshooting

**Frontend shows "Search failed. Is the backend running on port 3001?"**
The backend isn't running. Make sure the backend terminal window opened by `dev.bat` is still active and shows `Server running on port 3001`.

**Port already in use**
Another process is on port 3001 or 5173. You can change the backend port by creating `server/.env` with `PORT=<new-port>` and updating the proxy target in `client/vite.config.js` to match.
