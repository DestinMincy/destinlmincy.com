# Current Issues

## Open Follow-Ups

- `app/layout.tsx` `icons.apple` still points at `/img/dlm-logo--hex.svg`. iOS Safari ignores SVG for `apple-touch-icon`, so home-screen installs fall back to a page screenshot instead of the logo. Fixing this needs a proper 180x180 (or larger square) PNG/ICO brand asset committed to `public/img/`. A candidate PNG (`DLM_Logo.png`) exists locally but is untracked and out of scope to commit as part of this fix, so this is deferred until a square PNG asset is deliberately added to the repo.

## Unit 04 Review Findings - commit 5dceb17

- **minor — Maintainability**: `context/progress-tracker.md` current phase/goal still points at Unit 05 while Unit 04 review/merge is pending. **Resolved:** tracker now shows Unit 04 pending.
- **minor — Functional Correctness**: `lib/relationships/validation.ts` slug normalization lowercases before NFKD normalization. Compatibility symbols like `™` can decompose to uppercase ASCII after lowercasing, then get stripped. Normalize first, then lowercase. **Resolved:** reordered slugify pipeline.
- **minor — Data Integrity**: `app/admin/relationships/page.tsx` client-user count includes soft-removed memberships. Filter to ACTIVE only so removed users are not overcounted. **Resolved:** `listClientRelationships` counts only ACTIVE users via `_count.users.where.status = ACTIVE`.
- **trivial — Performance/Scalability**: `lib/auth/client-membership.ts` ACTIVE lookup/sort should be confirmed backed by a composite index on `clerkUserId, status, createdAt, id`. Schema has `@@index([clerkUserId])`; additional composite coverage deferred as non-blocking.
- **trivial — Maintainability**: `app/admin/page.tsx` workspace list should use a `<nav>` landmark instead of a plain `<div>` for assistive tech. **Resolved:** changed to `<nav aria-label="Workspaces">`.
- **minor — Maintainability**: `app/globals.css` `.button:disabled` rule sits inside an admin-only block but is global. **Resolved:** relocated to global button block with clarifying comment, removed duplicate in admin block.

## Unit 04 Third Review Findings - commit b172fca

- **minor — Maintainability**: `context/progress-tracker.md` has contradictory retry instructions about rate-limit handling. **Resolved:** clarified wording; manual rerun required after reset.
- **minor — Functional Correctness**: `app/admin/relationships/actions.ts` attach error message says account does not exist, but Clerk exact match with unverified email can still return a user. **Resolved:** copy clarifies both signup and verified email required.
- **trivial — Maintainability**: `lib/relationships/types.ts` shared default state objects should be frozen to prevent accidental mutation. **Resolved:** `as const` guards.
- **trivial — Maintainability**: `lib/relationships/validation.ts` lacks unit tests for pure validation/slugify functions. **Deferred:** not blocking; noted for future test unit.
- **minor — Maintainability**: `components/admin/AttachClientUserForm.tsx` imports `FormField` from `RelationshipForm.tsx`, creating awkward dependency direction. **Resolved:** extracted into shared `components/admin/FormField.tsx`.
- **major — Security**: `lib/auth/require-admin.ts` getAdminUser/requireAdminForPage trust primary email without checking verification status. **Resolved:** requires verified primary email before comparing against allowlist.
