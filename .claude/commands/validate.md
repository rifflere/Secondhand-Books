# /validate — Run the Full Test Suite

Run all tests and report results clearly. No arguments needed.

---

## Step 1 — Backend tests

```
cd server && npm test -- --runInBand
```

Report:
- Total test suites and tests
- Any failures: which file, which test name, what was expected vs. received

## Step 2 — Frontend tests

```
cd client && npx vitest run
```

Report:
- Total test files and tests
- Any failures: which file, which test name, what error

## Step 3 — Summary

Present a concise status table:

| Suite | Tests | Status |
|-------|-------|--------|
| Backend (Jest) | N | ✓ PASS / ✗ FAIL |
| Frontend (Vitest) | N | ✓ PASS / ✗ FAIL |

If everything passes: "All tests green. Run `/ship` to commit."

If anything fails: list the failing tests with their error messages. Do NOT automatically attempt to fix failures — report them and let the user decide what to do next.
