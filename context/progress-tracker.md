# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Unit 03 preparation for Clerk auth and access control.

## Current Goal

- Prepare to add Clerk auth, server-side protected route structure, and admin email allowlist enforcement.

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
- Decided: canonical brand colors are Blue `#2675e9`, Gold `#ffd700`, and Silver `#c0c0c0`.
- Decided: Unit 01 will stage Next.js alongside the existing Eleventy site. This branch is the launch path; when merged to `master`, the Next.js app is intended to ship.
- Decided: Unit 01 will include a restrained motion foundation: CSS motion tokens, `prefers-reduced-motion`, subtle hex-based public atmosphere, and small structural hover/focus transitions. It will not use particle fields, neural canvases, shimmer text, bouncing badges, blanket scroll fade-ups, or an animation dependency without a concrete CSS limitation.
- Implemented Unit 01 foundation: Next.js App Router, strict TypeScript config, metadata defaults, semantic theme tokens, self-hosted Zilla Slab and Hanken Grotesk fonts, persisted light/dark theme control, CSS-only hex atmosphere, public header/footer, and migrated public routes for `/`, `/about`, `/services`, `/work`, and `/contact`.
- Preserved legacy Eleventy source and moved legacy commands behind explicit `legacy:*` scripts.
- Confirmed `elatum/` has already been deleted by the owner and is not a protected migration area.
- Merged Unit 01 into `nextjs-application-overhaul` after CodeRabbit review and follow-up fixes.
- Selected Prisma for the data layer.
- Implemented Unit 02 data foundation: Dockerized local Postgres on host port `5434`, Prisma config/schema, generated-client workflow, initial migration, deterministic seed data, and a server-side Prisma client helper.
- Added baseline schema shells for client relationships, client users, applications/sites, projects, contract templates and versions, payment gates, subscription references, milestones, and deliverables.
- Documented the local database workflow and RDS production target in `docs/data-foundation.md`.

## In Progress

- None.

## Next Up

- Begin Unit 03: Clerk auth and access control.
- Add Clerk environment contract and protected route structure.
- Add server-side admin email allowlist enforcement.

## Open Questions

- Blog content format: Markdown or MDX.
- PDF generation engine for contracts: browser rendering, React PDF, or document-generation library.
- DocuSign integration mode and auth flow.
- Clerk subscription plan names/pricing.
- Exact Stripe metadata fields needed for manual payment-link/invoice attachment.
- Reverse proxy choice for EC2: Nginx or Caddy.
- Process manager choice: systemd or PM2.

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
- Prisma is the selected ORM and migration system.
- Local Docker Postgres uses host port `5434` to avoid conflicts with other local Postgres services.
- UI implementation must avoid generic AI/SaaS visual tropes; gradients require a documented functional or brand reason.
- Brand evolves the existing blue/gold/silver identity toward approachable/human/trustworthy rather than rebranding; the cold sci-fi execution (electric-blue glow, neural-canvas atmosphere, Orbitron) is retired.
- Zilla Slab and Hanken Grotesk replace Orbitron and Rajdhani in the Next.js app.
- Font roles are strict: Zilla Slab for display/headings/markers, Hanken Grotesk for body/UI.
- Production font loading is self-hosted only.
- Canonical brand palette: Blue `#2675e9`, Gold `#ffd700`, Silver `#c0c0c0`.
- Next.js will be staged alongside Eleventy during Unit 01; full Eleventy cleanup waits until Unit 16.
- Public-site motion should reinforce the hex motif and orientation through restrained CSS-first treatments; dashboards stay motion-light and do not inherit marketing atmosphere.

## Session Notes

- Existing working tree had unrelated modifications before context setup. Preserve them.
- Existing docs (`README.md`, `ROADMAP.md`, `DEPLOY_AWS.md`) describe the old static-site plan and will need revision in a later documentation unit.
- Unit 01 verification passed locally with `npm run typecheck`, `npm run build`, and `npm run legacy:build` using the system npm CLI path because the user-level npm shim points to a missing npm install.
- Production Next server was smoke-tested at `http://127.0.0.1:3000`; migrated public routes returned 200 and mobile/desktop screenshots were checked with Edge headless. Final handoff server is `next dev` on the same URL.
- Fixed Unit 01 theme initialization warnings: moved the inline bootstrap to Next's `Script` component and made the React theme toggle own its hydrated label/click state. Verified with `npm run typecheck`, `npm run build`, and an Edge console capture against a production build on `http://127.0.0.1:3001`.
- Addressed CodeRabbit review findings for Unit 01: validated the contact `topic` query parameter server-side, fixed CSS stylelint formatting, and kept theme changes functional when localStorage persistence is blocked.
- Fixed development theme-toggle hydration through forwarded hosts by allowing `127.0.0.1` and `*.ngrok-free.app` in Next dev origins, then restarted `next dev` on port 3000 and verified the toggle on `http://127.0.0.1:3000`.
- Unit 02 verification passed locally with Dockerized Postgres healthy on port `5434`, `npm run db:migrate -- --name init`, `npm run db:seed`, `npx prisma migrate status`, a Prisma read-count probe, `npm run typecheck`, and `npm run build`.
- During Unit 02 verification, `localhost:5432` resolved to an existing host Postgres service. The local database contract was moved to `127.0.0.1:5434`.
- `npm audit --omit=dev` reports moderate advisories in Prisma's dev server dependency and Next/PostCSS. The suggested fixes are breaking downgrades, so they were not applied in Unit 02.
