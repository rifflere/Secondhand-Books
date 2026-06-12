# /plan — Turn a Spec into an Implementation Plan

**Feature or spec path:** $ARGUMENTS

---

## Your job

Read the spec and write a concrete, step-by-step implementation plan. No code yet — just a precise plan that tells a developer exactly what to do and in what order.

## Step 1 — Read context

Read ALL of these before writing the plan:
- `docs/tech.md` — architecture, patterns, DB schema
- `docs/constitution.md` — hard constraints
- The spec file: `docs/features/$ARGUMENTS/spec.md` (or find the most recently modified spec without a `plan.md` if no argument given)
- Any existing files that the feature will modify (look them up based on the spec's "Files" field or by searching the codebase)

## Step 2 — Write the plan

Write to: `docs/features/NNNN-slug/plan.md`

Use this template:

```markdown
# Plan: Feature Name

## Prerequisites
List of existing files to read before starting. Include the specific functions/queries
that the new code will interact with.

## Implementation steps

### 1. Database — `server/config/init-db.js`
Exact SQL changes. Every ALTER must be wrapped in an INFORMATION_SCHEMA check.
Example:
  const [col] = await conn.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'new_col'`, [dbName]);
  if (col.length === 0) { await conn.query(`ALTER TABLE users ADD COLUMN new_col ...`); }

### 2. Repository — `server/repositories/XRepository.js`
List each new function. Include the exact SQL query.

### 3. Service — `server/services/XService.js`
List each new/changed function. Describe business logic, error cases (with status codes), call order.

### 4. Controller — `server/controllers/XController.js`
Input validation, service call, response format and status code.

### 5. Routes — `server/routes/X.js`
New route declarations with middleware chain.

### 6. Frontend service — `client/src/services/XService.js`
New axios calls.

### 7. Frontend hook (if needed) — `client/src/hooks/useX.js`
State shape, mutation functions.

### 8. Frontend UI — `client/src/pages/XPage.jsx`
Component structure, what state it consumes, user interactions to handle.

### 9. CSS — `client/src/index.css`
New class names needed (describe the visual intent, not exact values).

### 10. Backend tests — `server/__tests__/X.test.js`
List each test case. For each: route, setup (which pool.query mocks in which order), expected status.

### 11. Frontend tests — `client/src/tests/...`
List each test case. For each: what's rendered, what interaction, what assertion.

## Acceptance criteria
- [ ] All new backend tests pass (`cd server && npm test`)
- [ ] All new frontend tests pass (`cd client && npx vitest run`)
- [ ] The feature works end-to-end in the browser (describe the happy path)
- [ ] No existing tests broken
```

## After writing

Tell the user: "Plan written to `docs/features/NNNN-slug/plan.md`. Run `/build NNNN-slug` to implement it."

Do NOT start writing code.
