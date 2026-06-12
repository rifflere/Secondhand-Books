# Constitution — Hard Constraints

These rules are non-negotiable. If an implementation plan would violate any of them, raise it before writing code.

---

## Security

1. **No plaintext passwords** — always hash with `bcryptjs` at 10 rounds; never log, return, or store `password_hash` in API responses
2. **No server-side sessions** — auth is stateless JWT only; the token lives in `localStorage` (`sb_token`); never set cookies for auth
3. **Privacy via `is_public` only** — a shelf's contents are visible to others only when `is_public = TRUE`; `is_default` grants no visibility; never use `is_default` as a visibility check
4. **Unowned resources return 404** — when a user tries to access something they don't own, return 404 (not 403) to avoid leaking existence

## Architecture

5. **Layer discipline** — request path is always: route → controller → service → repository; controllers must not write SQL; services must not call `res.json`; repositories must not contain business logic
6. **No skipping layers** — a controller calling a repository directly (bypassing the service) is forbidden, even for simple lookups
7. **Admin is not root** — admin users can see all users and public shelves; they cannot see private shelf contents; admin status is a JWT claim (`isAdmin`) that requires re-login after being granted

## Database

8. **All user data cascades** — every table that references `users.id` must use `ON DELETE CASCADE`; no orphan data may remain after account deletion
9. **Migrations are additive and idempotent** — only `ADD COLUMN` and `CREATE TABLE IF NOT EXISTS`; never `DROP COLUMN`, `RENAME COLUMN`, or `ALTER COLUMN` type; every migration in `init-db.js` must check `INFORMATION_SCHEMA` before altering so it's safe to re-run on a live database
10. **Schema lives in `init-db.js`** — do not send raw `CREATE TABLE` or `ALTER TABLE` via one-off scripts on production; all changes go through `init-db.js`

## Testing

11. **Tests never hit the real database** — mock `config/database` in every backend test file; no real DB connections in tests
12. **Mock order must match call order** — `mockResolvedValueOnce` values are consumed in the exact order the service calls `pool.query`; trace the service function before writing mocks

## Code style

13. **Backend is CommonJS** — use `require()`/`module.exports` everywhere in `server/`; no `import`/`export` syntax
14. **Frontend is ES modules** — use `import`/`export` everywhere in `client/src/`
15. **Button types are explicit** — always set `type="button"` on non-submit buttons; HTML default is `type="submit"` which causes silent bugs in forms
16. **Labels are associated** — always pair `htmlFor` on `<label>` with `id` on `<input>`; required for accessibility and for RTL's `getByLabelText`

## Email / External services

17. **Email is optional** — `emailService.js` must degrade gracefully when `SMTP_HOST` is not set; fall back to `console.log` with the full email content; never crash the server for a missing SMTP config
18. **Open Library is the only external API** — book data comes from Open Library; never add API keys or third-party services without explicit approval
