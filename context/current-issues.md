# Current Issues

## Open Follow-Ups

- `app/layout.tsx` `icons.apple` still points at `/img/dlm-logo--hex.svg`. iOS Safari ignores SVG for `apple-touch-icon`, so home-screen installs fall back to a page screenshot instead of the logo. Fixing this needs a proper 180x180 (or larger square) PNG/ICO brand asset committed to `public/img/`. A candidate PNG (`DLM_Logo.png`) exists locally but is untracked and out of scope to commit as part of this fix, so this is deferred until a square PNG asset is deliberately added to the repo.

## Unit 04 Consolidated Review Findings

- **critical — Data Integrity**: `app/admin/relationships/actions.ts:96-99` slug collision suffix could exceed the 64-char ceiling, corrupting suffixed slugs. **Resolved:** exported `SLUG_MAX_LENGTH` and reserved room for the suffix before slicing/lookup; collision now proven by exact `findUnique` per candidate.
- **critical — Functional Correctness**: `components/admin/LifecycleControl.tsx` lifecycle select resets to original value on failed submit, disconnecting error from user choice. **Resolved:** `useActionState` now retains submitted lifecycle on error.
- **major — Security**: `lib/auth/require-admin.ts` getAdminUser/requireAdminForPage trust primary email without checking verification status. **Resolved:** requires verified primary email before comparing against allowlist.
- **major — Functional Correctness**: `app/admin/relationships/[id]/edit/page.tsx:48-57` RelationshipForm may reuse stale state across relationships. **Resolved:** keyed by `relationship.id`.
- **minor — Functional Correctness**: `app/admin/relationships/actions.ts` attach error message says account does not exist, but Clerk exact match with unverified email can still return a user. **Resolved:** copy clarifies both signup and verified email required.
- **minor — Functional Correctness**: `.button:disabled` allows hover styling to continue. **Resolved:** added `pointer-events: none`.
- **minor — Functional Correctness**: `components/admin/LifecycleControl.tsx:35-41` lifecycle select missing `aria-invalid` on server error. **Resolved:** exposed via `aria-invalid={state.error ? true : undefined}`.
- **minor — Data Integrity**: `app/admin/relationships/page.tsx` client-user count includes soft-removed memberships. Filter to ACTIVE only so removed users are not overcounted. **Resolved:** `listClientRelationships` counts only ACTIVE users via `_count.users.where.status = ACTIVE`.
- **minor — Maintainability**: `app/globals.css` `.button:disabled` rule sits inside an admin-only block but is global. **Resolved:** relocated to global button block with clarifying comment, removed duplicate in admin block.
- **minor — Maintainability**: `app/admin/relationships/page.tsx:79-96` primary-contact rendering triple-nested. **Resolved:** simplified to flat conditional.
- **minor — Maintainability**: `context/progress-tracker.md` has contradictory retry instructions about rate-limit handling. **Resolved:** clarified wording; manual rerun required after reset.
- **trivial — Functional Correctness**: `app/admin/relationships/actions.ts:137` slug-collision retry calls `isUniqueConstraintError(error)` without field scope, so unrelated `P2002` violations could trigger unnecessary slug regeneration. **Resolved:** narrowed retry to `isUniqueConstraintError(error, "slug")`.
- **trivial — Maintainability**: `components/admin/AttachClientUserForm.tsx` imports `FormField` from `RelationshipForm.tsx`, creating awkward dependency direction. **Resolved:** extracted into shared `components/admin/FormField.tsx`.
- **trivial — Maintainability**: `components/admin/FormField.tsx:38-41` validation errors not dynamically announced. **Resolved:** added `role="alert"` to error `<p>`.
- **trivial — Maintainability**: `components/admin/RemoveMembershipButton.tsx` accessible name ambiguous in per-row membership list. **Resolved:** added contextual `aria-label` prop with member name/email.
- **trivial — Maintainability**: `app/globals.css` `.link-button--danger:disabled` repeats disabled styles without `pointer-events`. **Resolved:** added `pointer-events: none`; full shared-var consolidation deferred unless another pass repeats it.
- **trivial — Maintainability**: `lib/relationships/types.ts` shared default state objects use `as const` for compile-time readonly guarantees but are not runtime-frozen. **Acknowledged:** acceptable for current usage; no mutation path observed in reviews.
- **trivial — Maintainability**: `lib/relationships/validation.ts` lacks unit tests for pure validation/slugify functions, which are the shared boundary for create/edit flows. **Deferred:** not blocking; noted for future test unit.
- **trivial — Performance/Scalability**: `lib/auth/client-membership.ts` ACTIVE lookup/sort should be confirmed backed by a composite index on `clerkUserId, status, createdAt, id`. Schema has `@@index([clerkUserId])`; additional composite coverage deferred as non-blocking.
- **trivial — Maintainability**: `app/admin/page.tsx` workspace list should use a `<nav>` landmark instead of a plain `<div>` for assistive tech. **Resolved:** changed to `<nav aria-label="Workspaces">`.
