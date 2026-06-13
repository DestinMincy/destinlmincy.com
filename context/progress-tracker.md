# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Planning and specification for Next.js client relationship OS migration.

## Current Goal

- Refine specs for moving `destinlmincy.com` from Eleventy to a Next.js application centered on client relationships, contracts, payments, subscriptions, projects, milestones, and portal/admin workflows.

## Completed

- Created six-file context pack.
- Created local branch `nextjs-application-overhaul`.
- Captured the product pivot from static Eleventy marketing site to authenticated Next.js application.
- Selected client relationship as the primary business object.
- Defined V1 domain model: client relationships, client users, applications/sites, projects, contracts, payment gates, subscriptions, milestones, deliverables.
- Selected app-owned contract templates with DocuSign for signatures only.
- Selected block-based contract editor with versioned database-managed templates.
- Selected S3 private bucket for generated and signed PDFs.
- Selected Dockerized local Postgres for development and RDS Postgres only when deployment/client need justifies cost.
- Selected Clerk for auth and subscriptions, Stripe for custom project invoices/payment links.
- Selected link-only deliverables for v1.
- Added a hard design rule against generic AI/vibe-coded UI tropes and decorative gradient overuse.
- Adopted `context/frontend-design-taste.md` as the authoritative ruleset for frontend visual design and UI copy, wired into the workflow rules, code standards, UI context, and Unit 01 spec.
- Committed a brand direction: approachable, human, trustworthy. Keep the deliberate blue/gold/silver palette (recalibrated for warmth: deeper blue, gold as sparing signal/warmth, silver as structural neutral, plus warm neutrals). Retire Orbitron and Rajdhani in favor of Zilla Slab over Hanken Grotesk. Lead with real photography of Destin and first-person voice.
- Decided: ship light and dark mode as first-class themes from the start, built on semantic theme-resolved tokens; dark is a warm dark, not the old cold blue-black; both verify WCAG AA.
- Decided: the hexagon is a core, integrated motif and the signature layout primitive (brand mark plus hex geometry in page elements), never a glowing neural-canvas background; dashboards stay rectangular with hex used only as markers/accents.
- Decided: Zilla Slab is the display/headings face and Hanken Grotesk is the body/UI face for the Next.js app.
- Decided: fonts must be self-hosted from Fontsource WOFF2 files. Do not use Google Fonts or external font requests in production.

## In Progress

- Refined unit specs are being created.
- No application implementation has started.

## Next Up

- User review of refined specs.
- After approval, move to implementation planning for Unit 01 only.

## Open Questions

- ORM choice: Prisma or Drizzle.
- Blog content format: Markdown or MDX.
- PDF generation engine for contracts: browser rendering, React PDF, or document-generation library.
- DocuSign integration mode and auth flow.
- Clerk subscription plan names/pricing.
- Exact Stripe metadata fields needed for manual payment-link/invoice attachment.
- Reverse proxy choice for EC2: Nginx or Caddy.
- Process manager choice: systemd or PM2.
- Exact recalibrated values for blue/gold/silver in each theme (pick at implementation, verify AA).

## Architecture Decisions

- Target app runtime is Next.js on EC2, replacing the current S3/CloudFront-only static deployment model.
- Clerk is the provider for authentication and subscription entitlements.
- Stripe handles project-specific invoices/payment links.
- DocuSign handles signatures after the app generates contract PDFs.
- Admin v1 uses email allowlist, not Clerk orgs.
- Client relationships support multiple client users in v1, with shared access.
- Client roles/permissions are deferred but anticipated.
- Contracts use one designated client signer in v1 and admin countersignature.
- Contract templates use draft, publish, and archive lifecycle.
- Published contract template versions are immutable.
- Generated contracts can be regenerated from template/version and fields, but not free-edited.
- Applications/sites are separate from projects because projects may modify existing assets.
- Applications/sites are admin-created in v1; client request flow is deferred.
- Client portal v1 includes contracts, payments, subscriptions, milestones, approvals, and link deliverables.
- Messaging and support tickets are deferred.
- Production database target is RDS Postgres, but Dockerized local Postgres is used until deployment/client need justifies RDS cost.
- UI implementation must avoid generic AI/SaaS visual tropes; gradients require a documented functional or brand reason.
- Brand evolves the existing blue/gold/silver identity toward approachable/human/trustworthy rather than rebranding; the cold sci-fi execution (electric-blue glow, neural-canvas atmosphere, Orbitron) is retired.
- Zilla Slab and Hanken Grotesk replace Orbitron and Rajdhani in the Next.js app.
- Font roles are strict: Zilla Slab for display/headings/markers, Hanken Grotesk for body/UI.
- Production font loading is self-hosted only.

## Session Notes

- Existing working tree had unrelated modifications before context setup. Preserve them.
- Existing docs (`README.md`, `ROADMAP.md`, `DEPLOY_AWS.md`) describe the old static-site plan and will need revision in a later documentation unit.
