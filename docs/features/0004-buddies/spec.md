# 0004 — Book Buddies

**Status:** Shipped  
**Files:** `server/services/buddiesService.js`, `server/repositories/buddiesRepository.js`, `client/src/pages/BuddiesPage.jsx`, `client/src/pages/DashboardPage.jsx`

---

## Why

Reading is more fun when shared. Buddies can browse each other's public shelves and see a live feed of what the other is saving.

---

## User-facing behavior

1. Users can search for other users by username (empty query returns 400)
2. Search results show relationship status: none / request-sent / request-received / already buddies
3. A user can send a buddy request; they cannot send one to themselves
4. If the target has already sent a request the other way, it auto-accepts on send
5. The receiver sees a badge on their Buddies nav link when a request arrives
6. Requests can be accepted or declined; only the receiver can respond (403 if not)
7. Accepted buddies can see each other's **public** shelves only
8. The dashboard activity feed shows books buddies have recently added to **public** shelves — private shelves are never included
9. Either user can remove a buddy at any time

---

## Data model

**friendships**
```
id INT PK AUTO_INCREMENT
requester_id INT → users(id) ON DELETE CASCADE
receiver_id INT → users(id) ON DELETE CASCADE
status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending'
created_at TIMESTAMP
UNIQUE KEY (requester_id, receiver_id)
```

---

## API

| Method | Path | Auth | Body / Params | Response |
|--------|------|------|---------------|----------|
| GET | `/api/buddies/search?q=` | ✓ | `q` required | `[{id, username, friendshipId, status, direction}]` |
| GET | `/api/buddies/feed` | ✓ | — | Recent public-shelf saves from buddies |
| GET | `/api/buddies/requests/incoming` | ✓ | — | Pending requests received |
| GET | `/api/buddies/requests/outgoing` | ✓ | — | Pending requests sent |
| GET | `/api/buddies` | ✓ | — | Accepted buddies |
| POST | `/api/buddies/request` | ✓ | `{username}` | 201; 400 self/missing username; 404 unknown; 409 duplicate |
| PATCH | `/api/buddies/:id` | ✓ | `{action: 'accept'\|'decline'}` | 204; 403 if not receiver; 400 invalid action |
| DELETE | `/api/buddies/:id` | ✓ | — | 204; 404 if not found |
| GET | `/api/users/:username/shelves` | ✓ | — | Buddy's public shelves |
| GET | `/api/users/:username/shelves/:shelfId/books` | ✓ | — | Books on a buddy's public shelf |

**Feed privacy:** the `findFeed` SQL query joins `shelves` and filters `s.is_public = TRUE`. Private shelves are excluded at the query level.

**Request flow:**
1. Look up target by username; 404 if not found
2. Controller validates `username` present; 400 if not
3. 400 if `toUser.id === fromUserId` (self-request)
4. Check for existing request (same direction) → 409 if found
5. Check for reverse request → auto-accept if pending
6. Otherwise create new request

---

## Client

- `DashboardPage.jsx` — activity feed + buddy avatar strip
- `BuddiesPage.jsx` — search, incoming/outgoing requests, buddies list
- `BuddyShelvesPage.jsx` — read-only shelf view when clicking a buddy
- `hooks/useBuddies.js`
- `services/buddiesService.js`

---

## Tests

### Backend (`server/__tests__/buddies.test.js`) — 12 tests
- `GET /search` — requires auth, returns results, 400 on missing query
- `GET /feed` — returns activity (public shelves enforced in DB query)
- `GET /requests/incoming` — returns list
- `GET /buddies` — returns accepted list
- `POST /request` — sends 201, 404 unknown user, 400 self (needs mock for findPublicByUsername), 400 missing username
- `PATCH /:id` — accept → 204, 403 if not receiver, 400 invalid action
- `DELETE /:id` — removes 204, 404 if not found
