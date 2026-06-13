# Architecture Context

## Current State

The repo currently contains an Eleventy 3.x static site under `src/`, generated into `_site/`, with deployment docs for S3 and CloudFront. The target architecture is a Next.js React application hosted on EC2. No Next.js code has been added yet.

## Target Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js App Router + React + TypeScript | Public site, blog, dashboards, route handlers |
| Runtime | Node.js on AWS EC2 | Server-rendered app runtime |
| Auth | Clerk | Sign-in, sign-up, sessions, user profile, protected routes |
| Admin Access | Email allowlist in env/config for v1 | Solo-admin authorization without Clerk org overhead |
| Subscriptions | Clerk Billing/entitlements | Hosting and maintenance subscription access |
| Custom Payments | Stripe invoices/payment links | Contract-specific upfront payments and deposits |
| Signatures | DocuSign API | Signature workflow after app-owned contract generation |
| Styling | Tailwind CSS plus CSS custom properties | Application styling while preserving brand tokens |
| UI Components | Local components, likely shadcn/ui where useful | Accessible dashboard, editor, table, and form primitives |
| Blog Content | MDX or Markdown files in repo | Versioned posts without a CMS dependency |
| App Data | PostgreSQL | Client relationships, contracts, projects, payments, milestones |
| Dev Database | Local Postgres | Development without early RDS spend |
| Production Database | RDS Postgres when justified | Durable managed database once deployment/client need exists |
| Document Storage | Private S3 bucket | Generated and signed contract PDFs |
| ORM | Undecided: Prisma or Drizzle | Must be selected before database-backed implementation |
| Web Server | Nginx or Caddy in front of Node | HTTPS termination/proxy on EC2 |
| Process | systemd or PM2 | Keep Next.js server running after deploy/reboot |

## System Boundaries

- `app/` - Next.js routes, layouts, route groups, route handlers, and metadata.
- `components/` - Reusable UI and feature components.
- `components/editor/` - Contract template editor blocks and controls when implemented.
- `content/blog/` - Repo-managed blog posts and post assets.
- `lib/auth/` - Clerk helpers, admin allowlist checks, relationship access checks.
- `lib/billing/` - Clerk subscription entitlement helpers and Stripe payment-link/invoice helpers.
- `lib/contracts/` - Template versioning, contract generation, PDF rendering, DocuSign orchestration.
- `lib/storage/` - S3 object storage and signed URL helpers.
- `lib/db/` - Data access, queries, transactions, and repositories after ORM selection.
- `db/` or `prisma/` - Database schema and migrations after ORM choice.
- `public/` - Static assets that must be served directly.
- `context/` - Product, architecture, workflow, and unit specs. Not runtime application code.
- `src/` - Current Eleventy source. It remains legacy until migration starts.

## Data Model Boundaries

Primary relational model:

- Client relationships own users, applications/sites, projects, contracts, payment gates, subscriptions, milestones, and deliverables.
- Client users reference Clerk user IDs and belong to one or more client relationships.
- Applications/sites are ongoing assets. Projects are scoped work efforts.
- Contracts reference a published immutable template version.
- Generated and signed contract PDFs are S3 objects referenced by database metadata.
- Payment gates reference Stripe invoice/payment-link identifiers or URLs.
- Subscriptions reference Clerk subscription/customer/entitlement data and optionally attach to application/site or project records.

## Storage Model

- **Clerk**: user identity, sessions, account profile, subscription primitives and entitlement state supported by Clerk Billing.
- **Stripe**: invoice/payment-link/payment state for contract-specific project payments.
- **DocuSign**: envelope workflow, signer routing, signature status, and signature completion events.
- **PostgreSQL**: app-owned domain data, relationships, contract metadata, template versions, payment gate records, milestones, deliverables, audit-friendly records.
- **S3 private bucket**: generated contract PDFs and final signed PDFs.
- **Repo files**: blog content and public copy during the first implementation pass.

## Auth And Access Model

- Public routes are readable without auth.
- `/portal` or `/dashboard` requires a signed-in Clerk user attached to a client relationship.
- `/admin` requires signed-in Clerk user plus explicit email allowlist.
- Admin authorization must not rely on client-side checks.
- Client relationship access must be verified server-side before reading contracts, projects, payments, subscriptions, milestones, or deliverables.
- V1 client users share access within the relationship. Record actor identity for approvals.
- Billing/subscription state must be checked from trusted Clerk/server data, not browser-supplied claims alone.

## Contract Flow

1. Admin creates/edits a contract template draft.
2. Admin publishes an immutable template version.
3. Admin creates a contract from a published version and contract-specific field values.
4. App generates a PDF and stores it in S3.
5. Admin sends generated PDF to DocuSign with one designated client signer and admin countersignature.
6. App tracks DocuSign envelope status through API/webhooks.
7. After both signatures, app stores final signed PDF in S3 and marks contract complete.

## Payment And Subscription Flow

- Project payment gates are contract-specific and tracked through Stripe invoice/payment-link metadata.
- V1 project payment records are manually attached by admin.
- Later Stripe API automation can create invoices/payment links from app data.
- Hosting and maintenance subscriptions are Clerk-managed recurring entitlements.
- Subscriptions may attach to a client relationship, application/site, or project.
- Cancellation defaults to access through the paid billing period end.
- Admin override can extend or cut off service access for edge cases; overrides must be visible and logged.

## Deployment Model

- EC2 hosts the Next.js runtime.
- A reverse proxy terminates HTTPS and forwards to the app process.
- Environment variables are managed on the instance or through AWS-managed secret storage.
- Development uses local Postgres.
- Production target is RDS Postgres, but RDS should not be provisioned until deployment/client need justifies the cost.
- S3 stores generated and signed contract PDFs from the first production contract workflow.
- Existing S3/CloudFront static deployment is legacy for the current Eleventy build and should not be extended for the Next.js server runtime without a clear reason.

## Invariants

1. Protected data is never exposed based only on client-side route hiding.
2. Admin access requires an explicit server-side authorization rule.
3. Client relationship data requires server-side relationship membership checks.
4. Published contract template versions are immutable.
5. Generated contracts cannot be free-edited outside the template/version plus field-value model.
6. Client-generated contracts are out of scope by design.
7. Signed contracts and generated PDFs are stored in private S3, not only on EC2.
8. Project payment gates and subscriptions are separate concepts.
9. Subscription access defaults to paid-period-end cancellation behavior unless an admin override says otherwise.
10. Public marketing and blog routes must remain crawlable and fast.
11. Blog content starts file-backed; adding a CMS requires a separate spec.
12. Do not mix legacy Eleventy implementation with new Next.js runtime paths after the migration starts.
