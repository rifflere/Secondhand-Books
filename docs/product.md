# Secondhand Books — Product Overview

## What it is

A personal book-tracking web app where users save books to named shelves, connect with reading buddies, and discover what friends are reading.

## Who it's for

Book lovers who want a simple, private home for their reading life — without social-media noise or algorithmic feeds.

## Core loop

Search Open Library → save to a shelf → share with buddies → see what they're saving

## Features shipped

| # | Feature | Summary |
|---|---------|---------|
| 0001 | Auth | Register, login, JWT session, email-based recovery, password reset |
| 0002 | Books | Search Open Library, save books, popular list (public shelves only) |
| 0003 | Shelves | Named shelves, public/private toggle, cross-shelf saves, orphan cleanup |
| 0004 | Buddies | Find users, request system, activity feed, browse public shelves |
| 0005 | Account | Stats page, self-service account deletion |
| 0006 | Admin | Admin panel: user list, grant/revoke admin, delete users, view public shelves |

## Privacy model

- **Private shelves are invisible everywhere** — not in buddy views, the activity feed, or the popular books count
- **Email is recovery-only** — never shown to other users, never used as a login identifier
- **Admins are not omniscient** — they see all users and public shelves, but cannot see private shelf contents
- **Ownership is opaque** — unowned/private resources return 404 (not 403) to avoid revealing existence

## Out of scope

- Reading progress tracking (in progress, finished, etc.)
- Social features beyond buddies (comments, ratings, reviews)
- Book recommendations or ML
- Mobile app
- OAuth / social login
