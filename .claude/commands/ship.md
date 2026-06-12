# /ship — Commit When Tests Pass

Commit message hint (optional): $ARGUMENTS

---

## Step 1 — Run all tests

Run exactly as `/validate` does:

```
cd server && npm test -- --runInBand
cd client && npx vitest run
```

**If any test fails:** Stop. Report the failures. Do NOT commit. Tell the user to fix the failures first, then re-run `/ship`.

## Step 2 — Check git status

```
git status
git diff --stat
```

Show the user which files have changed so they can confirm the commit scope looks right.

## Step 3 — Commit

Only if all tests passed and the user confirms the scope:

```
git add -p   # (stage interactively) — or stage specific files if scope is clear
git commit
```

Write a commit message following this format:
- First line: `type: short imperative summary` (under 72 chars)
  - Types: `feat` (new feature), `fix` (bug fix), `refactor`, `test`, `docs`, `chore`
- Blank line
- Body: one or two sentences explaining the WHY, not the WHAT
- Footer: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

Example:
```
feat: add shelf privacy toggle to public/private

Private shelves now disappear from buddy views, the activity feed,
and the popular books count. Enforced at the query level.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Step 4 — Confirm

After committing, run `git log --oneline -3` to show the last 3 commits so the user can confirm the commit landed correctly.

Do NOT push unless the user explicitly asks.
