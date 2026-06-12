# 0003 — Shelves

**Status:** Shipped  
**Files:** `server/services/shelvesService.js`, `server/controllers/shelvesController.js`, `client/src/pages/ShelvesPage.jsx`, `client/src/hooks/useShelves.js`

---

## Why

Users need named containers for their books. Shelves can be public (visible to buddies) or private (invisible everywhere). The Main Shelf is the default home for newly-saved books.

---

## User-facing behavior

1. Every user gets a **Main Shelf** (`is_default = TRUE`, `is_public = TRUE`) automatically at registration
2. Users can create additional named shelves; names must be non-empty
3. Each shelf has an independent public/private toggle
4. **Private shelves are invisible everywhere:** not in buddy views, the activity feed, or the popular books count
5. Main Shelf cannot be deleted; other shelves can
6. Deleting a shelf triggers orphan cleanup: books that were only on that shelf are deleted from the library; books that also appear on another shelf are kept
7. A book can be on multiple shelves simultaneously (cross-shelf saves via `book_shelves`)
8. `PATCH /shelves/:id` returns **204** (no body) for both rename and toggle

---

## Data model

**shelves**
```
id INT PK AUTO_INCREMENT
user_id INT → users(id) ON DELETE CASCADE
name VARCHAR(100) NOT NULL
is_public BOOLEAN NOT NULL DEFAULT FALSE
is_default BOOLEAN NOT NULL DEFAULT FALSE
created_at TIMESTAMP
```

---

## API

| Method | Path | Auth | Body / Params | Response |
|--------|------|------|---------------|----------|
| GET | `/api/shelves` | ✓ | — | `[{id, name, isPublic, isDefault, bookCount, createdAt}]` |
| POST | `/api/shelves` | ✓ | `{name}` | `{id, name, isPublic, isDefault, bookCount}` 201 |
| PATCH | `/api/shelves/:id` | ✓ | `{name?} \| {isPublic?}` | 204 |
| DELETE | `/api/shelves/:id` | ✓ | — | 204; 403 if is_default |
| GET | `/api/shelves/:id/books` | ✓ | `?sort=date\|title&dir=asc\|desc` | `[{id, olKey, title, ...}]` |
| POST | `/api/shelves/:id/books` | ✓ | `{bookId}` | 201; 409 if already on shelf |
| DELETE | `/api/shelves/:id/books/:bookId` | ✓ | — | 204 |

**Ownership:** unowned shelves always return **404** (not 403) — don't reveal existence.

**Buddy view** (users router):
- `GET /api/users/:username/shelves` — public shelves only (`is_public = TRUE`)
- `GET /api/users/:username/shelves/:shelfId/books` — 403 if shelf is not public

---

## Client

- `ShelvesPage.jsx` — tab strip (one per shelf), book grid, shelf toolbar (rename, toggle, delete)
- `ShelfPage.jsx` — single-shelf deep-link view
- `ShelfCard.jsx` — book card with × remove button + add-to-other-shelf dropdown
- `BuddyShelvesPage.jsx` — read-only shelf view for a buddy (`ReadOnlyShelfCard`)
- `hooks/useShelves.js` — shelf list + CRUD mutations
- `hooks/useShelf.js` — books on a single shelf + remove/add mutations
- `services/shelvesService.js`

---

## Tests

### Backend (`server/__tests__/shelves.test.js`) — 15 tests
- `GET /shelves` — auth required, returns list
- `POST /shelves` — creates shelf 201, 400 on missing name
- `PATCH /shelves/:id` — rename returns 204, unowned returns 404, nonexistent returns 404, toggle visibility returns 204
- `DELETE /shelves/:id` — deletes + orphan cleanup 204, 403 for Main Shelf, 404 for nonexistent
- `GET /shelves/:id/books` — returns book list
- `POST /shelves/:id/books` — adds 201, 409 if already on shelf
- `DELETE /shelves/:id/books/:bookId` — removes 204

### Frontend (`client/src/tests/hooks/useShelves.test.js`) — 6 tests
- Loads on mount, sets error on fail, createShelf appends, updateShelf merges, deleteShelf removes, reload re-fetches
