# 0002 — Books (Save, Search, Popular)

**Status:** Shipped  
**Files:** `server/services/shelfService.js`, `server/controllers/booksController.js`, `client/src/pages/SearchPage.jsx`, `client/src/components/BookCard.jsx`

---

## Why

Books are the core object in the product. Users discover them via search or the popular list and save them to shelves. A book saved by user A is independent of the same book saved by user B.

---

## User-facing behavior

1. Any visitor can see the popular books list — the most-saved books across all public shelves
2. Any visitor can search Open Library by title
3. Each result card shows: cover, title, author, year, page count, save count (across public shelves)
4. A signed-in user can save a book directly to their Main Shelf, or pick a specific shelf from a dropdown
5. Saving the same Open Library key twice returns "Book already on shelf" / 409 (per-user uniqueness)
6. A signed-in user can view all their saved books, sorted by date added or title (asc/desc)
7. Removing a book: if it's on other shelves it stays; if it's on no other shelf it's deleted from the library entirely

---

## Data model

**books**
```
id INT PK AUTO_INCREMENT
user_id INT → users(id) ON DELETE CASCADE
external_id VARCHAR(255)              -- Open Library key, e.g. /works/OL12345W
title VARCHAR(500) NOT NULL
author VARCHAR(255)
publication_year INT
cover_url TEXT
pages INT
created_at TIMESTAMP
UNIQUE KEY (user_id, external_id)
```

**book_shelves** (join table — a book can be on many shelves)
```
book_id INT → books(id) ON DELETE CASCADE
shelf_id INT → shelves(id) ON DELETE CASCADE
added_at TIMESTAMP
PRIMARY KEY (book_id, shelf_id)
```

---

## API

| Method | Path | Auth | Body / Params | Response |
|--------|------|------|---------------|----------|
| GET | `/api/books/popular` | — | — | `[{olKey, title, author, year, cover, pages, saveCount}]` |
| GET | `/api/books/search?q=` | — | `q` required | Open Library results |
| GET | `/api/books` | ✓ | `?sort=date\|title&dir=asc\|desc` | `[{id, olKey, title, author, ...}]` |
| POST | `/api/books` | ✓ | `{title, author?, year?, cover?, pages?, olKey?, shelfId?}` | `{id, ...book}` 201 |
| DELETE | `/api/books/:id` | ✓ | — | 204 |

**Popular filter:** only includes books that appear on at least one `is_public = TRUE` shelf (EXISTS subquery).

**Save logic (service):**
1. If `olKey` provided: check `findByExternalId` — if already exists, throw 409
2. `booksRepository.create` — insert book row
3. Find target shelf: `shelfId` if provided and owned, else `findDefault` (Main Shelf)
4. `shelvesRepository.addBook` — insert into `book_shelves`

**Delete logic:** `booksRepository.remove` does a single `DELETE FROM books WHERE id = ? AND user_id = ?`; `book_shelves` cascade-deletes automatically.

---

## Client

- `SearchPage.jsx` — search form, results grid, popular section
- `BookCard.jsx` — cover/metadata display + save button + shelf picker dropdown (`saveStatus`: idle/saving/saved/duplicate)
- `hooks/useSearch.js` — search query state + results
- `hooks/usePopular.js` — popular list
- `services/bookService.js` — `searchBooks`, `saveBook`, `getPopularBooks`, `getUserBooks`

---

## Tests

### Backend (`server/__tests__/books.test.js`) — 12 tests
- `GET /popular` — returns public-shelf books, handles empty
- `GET /search` — 400 on missing/empty q
- `GET /books` — requires auth, returns list, passes sort params
- `POST /books` — saves (correct mock order: findByExternalId → create → findDefault → addBook), 409 on duplicate, 400 on missing title, requires auth
- `DELETE /books/:id` — deletes (single DELETE query mock), 404 for missing, requires auth
