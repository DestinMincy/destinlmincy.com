# Code Standards

## General

- Keep modules small and single-purpose.
- Do not introduce abstractions until duplication or complexity proves they are needed.
- Prefer framework-native patterns over custom infrastructure.
- Validate external input at boundaries before trusting it.
- Do not mix public marketing, dashboard behavior, billing logic, and admin operations in the same component or route handler.

## TypeScript

- Strict TypeScript is required for the Next.js app.
- Avoid `any`; use explicit types, inferred local types, or validated schemas.
- Use runtime validation for route handlers, webhook payloads, and form submissions.
- Keep server-only helpers out of client components.

## Next.js

- Use the App Router.
- Default to server components.
- Add `"use client"` only for browser interactivity, Clerk client components, or local state that genuinely requires it.
- Use route groups to separate public, auth, dashboard, and admin surfaces.
- Keep route handlers focused on one resource or operation.
- Use Next metadata APIs for SEO and Open Graph.

## Clerk

- Enforce protected routes server-side through middleware, server helpers, or route handlers.
- Do not rely on hidden navigation as access control.
- Keep Clerk environment variable names documented in deployment notes.
- Subscription checks must use trusted Clerk/server-side state.
- Webhook handling, if added, must verify signatures before processing.

## Contracts

- Published contract template versions are immutable.
- Generated contracts must reference the exact template version and field values used.
- Generated contracts must not be free-edited as documents.
- Contract PDFs belong in private S3, with database metadata pointing to the object.
- DocuSign handles signatures only; the app owns contract content and generation.

## Payments And Subscriptions

- Project payment gates and recurring subscriptions are separate concepts.
- Stripe invoice/payment-link records represent custom project payment obligations.
- Clerk subscription records represent hosting/maintenance service entitlements.
- Do not model project deposits as subscriptions.
- Do not model recurring hosting/maintenance access as one-off project payments.

## Styling

- Start from the existing brand tokens in `ui-context.md`.
- Tailwind is acceptable, but color choices should map to CSS variables rather than hardcoded hex values.
- Dashboard UI should prioritize readability over decorative effects.
- Do not add visible instructional text that explains the UI instead of making the UI clear.

## Blog

- Blog posts start as repo-managed Markdown or MDX.
- Each post requires title, description, date, slug, and Open Graph metadata.
- Blog rendering must support sitemap and RSS generation.
- Do not add a CMS in the first pass.

## Data And Storage

- App-owned durable state belongs in PostgreSQL.
- Development uses local Postgres.
- Production PostgreSQL target is RDS, but provisioning waits until deployment/client need justifies the spend.
- Migrations are mandatory once a database is introduced.
- Do not store secrets or credentials in repo files.
- Generated and signed PDFs belong in private S3, not local EC2 storage.

## File Organization

- `app/` - routes, layouts, metadata, route handlers.
- `components/` - reusable UI and feature components.
- `content/blog/` - blog source files.
- `lib/` - server utilities, auth/billing helpers, validation, data access.
- `db/` or `prisma/` - schema and migrations after ORM choice.
- `public/` - static assets.
- `context/` - specs and project context only.

## Verification

- Run the smallest relevant checks for the unit being changed.
- For UI work, verify responsive behavior at mobile and desktop widths.
- Before deployment work is considered done, verify a production build and local production start command.
