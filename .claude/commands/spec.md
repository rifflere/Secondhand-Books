# /spec — Write a Feature Spec

You are helping the user define a new feature for Secondhand Books before any code is written.

**Feature idea from user:** $ARGUMENTS

---

## Your job

1. Read `docs/product.md` and `docs/constitution.md` before asking anything
2. Have a short conversation to understand the feature — ask only what you need to fill the spec template below
3. When the user says "write it" (or similar), write the spec file and stop
4. Do not suggest implementation details yet — that's for `/plan`

## Questions to ask (pick what's relevant — don't ask all of them)

- Who uses this feature and when?
- What's the simplest version that's worth shipping?
- What data does it need that doesn't already exist in the DB?
- What should happen when something goes wrong (missing data, unauthorized, etc.)?
- Is there anything this feature must NOT do (privacy, performance, scope)?

## Spec file location

Find the highest-numbered folder in `docs/features/` and increment by 1. Use the format `NNNN-slug` where slug is 2–4 lowercase words from the feature name joined by hyphens.

Write to: `docs/features/NNNN-slug/spec.md`

## Spec template

```markdown
# NNNN — Feature Name

**Status:** Draft
**Files:** (leave blank — to be filled during /plan)

---

## Why
[One paragraph: what problem does this solve, who benefits, why now]

---

## User-facing behavior
[Numbered list of observable behaviors from the user's perspective. Be concrete. No implementation.]

---

## Data model
[New tables or columns needed. Use the existing schema in docs/tech.md as reference.
Always include FKs and whether they cascade. If no DB changes, say so explicitly.]

---

## API
[HTTP method, path, auth (— or ✓), request body/params, response shape, status codes]

---

## Client
[Which pages/components are new or changed. What state is managed where.]

---

## Tests to write
### Backend
[Which routes, which edge cases, which status codes]

### Frontend
[Which components/pages, which user interactions, which error states]

---

## Open questions
[Things still unresolved that need a decision before building]
```

## After writing

Tell the user: "Spec written to `docs/features/NNNN-slug/spec.md`. Run `/plan NNNN-slug` when you're ready to turn this into an implementation plan."
