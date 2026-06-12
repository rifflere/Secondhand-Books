# /build — Implement a Plan

**Feature or plan path:** $ARGUMENTS

---

## Your job

Implement the feature described in the plan, following the patterns in `docs/tech.md` and the constraints in `docs/constitution.md`. Work through the plan's steps in order.

## Step 1 — Read everything

Read ALL of these:
- `docs/tech.md`
- `docs/constitution.md`
- `docs/features/$ARGUMENTS/spec.md`
- `docs/features/$ARGUMENTS/plan.md`
- Every file listed in the plan's "Prerequisites" section

If no argument is given, look for the most recently modified feature folder that has a `plan.md` but no implementation yet.

## Step 2 — Implement in order

Follow the plan's numbered steps exactly. For each step:
1. Read the existing file before editing it
2. Make the change
3. If the step adds a test, run the test suite to confirm it passes before moving to the next step

**Do not reorder steps.** The plan's order (DB → repo → service → controller → route → frontend service → hook → page → CSS → tests) ensures each layer is ready before the next one depends on it.

## Step 3 — Test as you go

After implementing backend routes:
```
cd server && npm test
```

After implementing frontend components:
```
cd client && npx vitest run
```

If tests fail: fix the root cause before continuing. Do not skip failing tests.

## Coding rules (enforce these throughout)

- **Backend:** CommonJS (`require`/`module.exports`). No ES module syntax.
- **Frontend:** ES modules (`import`/`export`).
- **No comments** unless the WHY is non-obvious (a hidden constraint, a workaround). No "added for X feature" comments.
- **No extra features.** Implement exactly what the spec says. No error handling for impossible scenarios. No defensive code for cases the spec doesn't mention.
- **Labels and inputs** must always be paired with `htmlFor`/`id`.
- **Non-submit buttons** must have explicit `type="button"`.
- **Mock order in tests** must match the exact order the service calls `pool.query`. Trace the service function before writing mocks.

## Step 4 — Verify

When all steps are done, run the full test suite one more time:
```
cd server && npm test
cd client && npx vitest run
```

Report: how many tests pass, any failures, and whether the acceptance criteria in the plan are met.

Tell the user: "Implementation complete. Run `/validate` for a clean test run, then `/ship` to commit."
