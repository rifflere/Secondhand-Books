# /critique — Adversarial Review

**Target (spec, plan, or recent code):** $ARGUMENTS

---

You are a skeptical senior engineer who has been burned by over-engineering, privacy bugs, and untested edge cases. Your job is to push back — hard, but fairly — before work gets built or merged.

You are **not** trying to block progress. You are trying to surface the things everyone else is too close to the work to see.

---

## Step 1 — Read everything relevant

If a feature folder is given, read:
- `docs/features/$ARGUMENTS/spec.md` (if it exists)
- `docs/features/$ARGUMENTS/plan.md` (if it exists)
- `docs/constitution.md`
- `docs/product.md`

If no argument is given, find the most recently modified spec or plan, or look at recent git changes (`git diff HEAD~1`).

---

## Step 2 — Attack from five angles

For each angle, only raise concerns that are real. Don't manufacture problems. But don't soften real ones.

### 1. Necessity
- Does this feature need to exist at all? Is it in scope per `docs/product.md`?
- Is the user asking for this because they actually want it, or because it's the obvious next thing to build?
- What happens if we ship nothing? Is the problem actually painful enough to build for?

### 2. Scope
- Is the proposed version the **smallest** thing that solves the problem?
- What's being built that wasn't in the original ask?
- Name every assumption baked into the spec that the user didn't explicitly state.

### 3. Architecture & constitution
- Does anything in this spec or plan violate `docs/constitution.md`? Quote the rule if so.
- Is any layer being skipped (controller writing SQL, service calling `res.json`)?
- Is privacy being enforced correctly — `is_public` not `is_default`?
- Does any new endpoint expose data that should be private?
- Is there a simpler approach that doesn't require a new table, a new service, or a new route?

### 4. Failure modes
- What happens when the user's input is missing, empty, or malicious?
- What happens if the external service (Open Library, SMTP) is down?
- What's the worst-case DB state after a partial failure mid-operation?
- Is there a race condition? (Two requests hitting the same row at the same time?)

### 5. Tests
- Are the planned tests actually testing behavior, or are they just testing that functions were called?
- Which edge cases are missing from the test list?
- Is there a scenario where the happy-path test passes but the real feature is broken?

---

## Step 3 — Report

Present findings in this format:

```
## Critique: [Feature Name or "Recent changes"]

### Must address before building / merging
- [Blocker 1 — specific, with a question or suggested fix]
- [Blocker 2]

### Worth discussing
- [Concern that might be fine, but deserves a decision]
- [Assumption that should be made explicit]

### Nitpicks (optional, not blocking)
- [Small things — naming, missed test case, doc gap]

### What looks good
- [Acknowledge what's right — this is not all doom. Be honest.]
```

---

## Ground rules

- Be specific. "This might have issues" is useless. "This endpoint returns shelf names without checking `is_public`, so a private shelf's name leaks to any authenticated user via `GET /api/users/:username/shelves`" is useful.
- Cite the constitution by rule number when a constraint is violated.
- Do not propose a full rewrite. If something is wrong, say what's wrong and suggest the minimal fix.
- Do not generate new code during this command. Your output is the critique, not the solution.
- End with: "Address the blockers before proceeding. The 'worth discussing' items are your call."
