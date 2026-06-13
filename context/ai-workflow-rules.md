# AI Workflow Rules

## Approach

Build this migration through small, spec-driven units. The repo currently has an Eleventy site; the target is a Next.js client relationship OS with Clerk auth, Clerk subscriptions, Stripe project payment gates, DocuSign signatures, app-owned contract generation, blog, client portal, admin hub, and EC2 deployment. Do not implement from memory or vibes. Read the context pack and the active spec first.

For any UI work, `context/frontend-design-taste.md` is required reading and is the authority on visual design and UI copy. It outranks framework, Tailwind, and component-library defaults. Reconcile it with the project brand using `context/ui-context.md`.

## Scoping Rules

- Work on one unit spec at a time.
- Do not combine unrelated public-site, auth, contract, payment, subscription, portal, admin, database, and deployment work in one implementation step.
- Introduce dependencies just in time for the current or next unit.
- If a requirement is unclear, update the spec or add an open question before coding around it.
- Do not code during planning-only sessions.

## When To Split Work

Split an implementation step if it combines:

- Framework migration and feature implementation.
- Auth setup and subscription entitlement logic.
- Contract generation and DocuSign signature flow.
- Stripe project payment gates and Clerk subscriptions.
- Blog rendering and relationship OS data modeling.
- Client portal and admin hub behavior.
- EC2 deployment and app feature work.
- Database schema decisions and unrelated UI polish.
- UI implementation before design direction is clear.

## Handling Missing Requirements

- Do not invent pricing, plan names, entitlements, or admin roles.
- Do not invent client portal data models beyond the relationship OS specs.
- Do not collapse project payment gates and subscriptions into one billing abstraction.
- Do not allow generated contracts to bypass published template versions.
- Do not introduce generic AI/SaaS visual tropes when building UI; follow `context/frontend-design-taste.md`.
- Do not add database tables until a unit spec names the data and verification path.
- Add unresolved decisions to `context/progress-tracker.md`.

## Protected / Legacy Areas

- Preserve unrelated uncommitted user changes.
- Treat `src/` as legacy Eleventy source until the migration unit explicitly replaces it.
- During Unit 01, stage Next.js alongside Eleventy. Do not delete Eleventy source while establishing the foundation.
- Treat `_site/` as generated output.
- Do not modify contract, payment, subscription, or access-control behavior outside the active unit spec.

## Keeping Docs In Sync

Update the relevant context file whenever implementation changes:

- Product scope or success criteria.
- Architecture or storage model.
- Auth, billing, or access-control rules.
- UI conventions.
- Frontend design taste, blocklist, or brand reconciliation (`context/frontend-design-taste.md`).
- Code standards.
- Current progress or open questions.

## Before Moving To The Next Unit

1. The current unit works within its defined scope.
2. Relevant build, lint, or test checks pass.
3. Access control rules are verified for protected surfaces.
4. `context/progress-tracker.md` reflects the completed work and next unit.
