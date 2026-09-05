# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Unit 05: applications/sites and projects implementation.

## Current Goal

- Complete the Unit 05 review gate and merge `unit-05-applications-sites-projects`.

## Completed

- Created six-file context pack.
- Created local branch `nextjs-application-overhaul`.
- Captured the product pivot from static Eleventy marketing site to authenticated Next.js application.
- Selected client relationship as the primary business object.
- Defined V1 domain model: client relationships, client users, applications/sites, projects, contract templates and versions, payment gates, subscription references, milestones, deliverables.
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
- Decided: canonical brand colors are Blue `#2675e9`, Gold `#ffd700`, Silver `#c0c0c0`.
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
- Implemented Unit 03 Clerk auth and access control: `@clerk/nextjs` SDK, `proxy.ts` (Next.js 16 renamed `middleware.ts`) running `clerkMiddleware()` to require sign-in before `/portal` and `/admin` render, `<ClerkProvider>` in the root layout, and `/sign-in`/`/sign-up` routes using themed Clerk components (`SignIn`/`SignUp` with an `appearance.variables` mapping to the site's semantic tokens, not custom auth screens).
- Added `lib/auth/admin-allowlist.ts` (parses the `ADMIN_EMAILS` env allowlist, case-insensitive/trimmed) and `lib/auth/client-membership.ts` (Prisma lookup of a Clerk user id against `ClientUser`/`ClientRelationship` from Unit 02).
- Added spartan placeholder pages: `/portal` (shows the linked client relationship name, or a "no client relationship on file" contact message for signed-in users with no membership) and `/admin` (returns 404 via `notFound()` for signed-in non-admins; renders a minimal operator console for allowlisted admins). Real dashboards remain Unit 12/13 scope.
- Documented Clerk env vars in `.env.example`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `ADMIN_EMAILS`. Real keys live in gitignored `.env.local`, pulled via `clerk env pull` after linking the repo to the existing `destinlmincy.com` Clerk application.
- Did not wire sign-in/portal/admin links into `SiteHeader`/`SiteFooter` nav; that was judged out of this unit's listed scope and is deferred to whichever unit builds the real portal/admin shells (Unit 12/13).
- Discovered and fixed a Clerk instance configuration defect that would have broken real sign-ins: `organization_settings.force_organization_selection` defaulted to `true` on the new Clerk application, forcing every user through an organization setup screen this project's v1 does not use. Disabled it permanently on the development instance. If a production Clerk instance is created later (Unit 15), the same setting must be disabled there too.
- Implemented Unit 04 client relationship core: admin list/create/view/edit for client relationships under `/admin/relationships`, lifecycle updates from the detail view, and Clerk-backed client user attach/list/remove with shared access (no roles).
- Extended the schema additively (migration `add_relationship_contact_and_client_user_status`): `ClientRelationship` gained `legalName`, `primaryContactName`, `primaryContactEmail`, `primaryContactPhone`; `ClientUser` gained `status` (`ClientUserStatus` enum: `ACTIVE`, `REMOVED`, default `ACTIVE`). The lifecycle enum already contained all nine spec states from Unit 02 and was not changed. Removal is a soft deactivate (`REMOVED`), so membership history is kept and re-attaching the same email reactivates the row instead of duplicating it.
- `findClientMembershipByClerkUserId` now matches only `ACTIVE` memberships, so removing a client user actually revokes portal access.
- All Unit 04 mutations are server actions in `app/admin/relationships/actions.ts`; every action re-checks the admin allowlist server-side (`lib/auth/require-admin.ts` wraps the Unit 03 pattern for pages and actions), validates input at the boundary (`lib/relationships/validation.ts`: required name, length ceilings, email shape, lifecycle enum membership), and returns field-level errors instead of throwing.
- Client user attachment resolves the email against the Clerk development instance with `clerkClient().users.getUserList({ emailAddress })` and stores the Clerk user id, normalized email, and display name on `ClientUser`; an unmatched or unverified email returns a clear form error requiring signup and verification, and duplicates are rejected.
- Relationship slugs are generated server-side from the name (lowercase, diacritics stripped, numeric suffix on collision) and are intentionally stable across renames.
- Unit 04 CodeRabbit follow-up completed cleanly at commit `1841883`, then Unit 04 merged to `master` through PR #7 (`63e4f90`).
- Dependabot security remediation merged through PR #8 (`88de819`).
- Added the square DLM logo asset to `master` at commit `047f510`.
- Implemented Unit 05 applications/sites and projects: additive Prisma models and migration, relationship-scoped admin list/create/edit/archive workspaces, project-to-application attachment, new-asset tracking, operational URLs and dates, and read-only active work in the client portal.
- Added reusable Unit 05 boundary validation plus unit, PostgreSQL integration, and Playwright E2E coverage. Live E2E verified authorized admin CRUD/archive, invalid URL rejection, contradictory create-state rejection, form-value retention after errors, project attachment, client read-only visibility, archived-record filtering, and signed-in non-admin 404 behavior.
- Made project create/update writes serializable so an application/site cannot be archived between selection validation and persistence; added a concurrent archive/save integration regression test. Typecheck, unit tests, PostgreSQL integration, production build, and the uncommitted CodeRabbit review all pass. Committed-review findings were resolved by enforcing the create-time new-asset/attachment invariant inside the write boundary with an integration regression test, typing project application options from the shared generated status contract, and preventing Unit 05 E2E database setup unless destructive access is explicitly enabled for the exact `destinlmincy_test` database or `unit05_e2e` schema.

## In Progress

- Unit 05 final committed review and merge gate.

## Next Up

- Run the Unit 05 review gate and merge it before beginning Unit 06.
- Begin Unit 06: contract template editor per `context/specs/06-contract-template-editor.md`.

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
- Clerk is linked via the `clerk` CLI to the existing `destinlmincy.com` application (development instance); `/portal` is the client portal route name (architecture's "/portal or /dashboard" choice) and `/admin` is the operator route. Both are gated by `proxy.ts` (Next.js 16's renamed `middleware.ts`; `clerkMiddleware()` itself is unchanged) plus a server-side check in the page component (membership lookup for `/portal`, `ADMIN_EMAILS` allowlist for `/admin`).
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
- Addressed committed CodeRabbit follow-up for Unit 02 by centralizing the `DATABASE_URL` invariant in a side-effect-free helper, reusing it from the Prisma client and seed script, and caching newly created Prisma clients on `globalThis`.
- Addressed PR #5 CodeRabbit findings: shared contact topic options (adds `agent-ops`), typed page `metadata` exports, header DOM/tab order, shared theme storage key in `lib/theme.ts`, loopback-only Docker Postgres port, trimmed `DATABASE_URL` validation, `navItems` `as const`, compound `[id, clientRelationshipId]` constraints via the `enforce_relationship_scoped_compound_fks` migration (applied and reseeded locally without reset), Prisma locked in the Unit 02 spec, payment-gate spec narrowed to contract-scoped attachment per architecture, kickoff template read order now includes `context/current-issues.md`, and the kickoff bootstrap script rejects `--entry` paths that escape the target repo. The SVG apple-touch-icon finding is deferred to `context/current-issues.md` pending a committed square PNG asset.
- Unit 03 verification: `npm run typecheck` and `npm run build` both pass (`proxy.ts` shows as `ƒ Proxy (Middleware)` in the build route summary; `/portal`, `/admin`, `/sign-in`, `/sign-up` render as dynamic `ƒ` routes). Live HTTP checks against a local `next start` server (port 3101, to avoid an unrelated process already on 3000) confirmed signed-out behavior: `/`, `/about`, `/services`, `/work`, `/contact`, `/sign-in`, `/sign-up` all return 200; `/portal` and `/admin` return 307 to `/sign-in?redirect_url=...`.
- Signed-in behavior was verified live end-to-end (not just by construction) using three disposable Clerk dev-instance test users created and later deleted via the `clerk` CLI, driven through the real `<SignIn/>` UI with the gstack `/browse` headless browser: a user linked to the seeded `ClientUser` row saw the `DLM Demo Relationship` name on `/portal` and got a 404 on `/admin`; a user with no `ClientUser` row saw the "No client relationship on file" message on `/portal` and also 404 on `/admin`; a user added to `ADMIN_EMAILS` saw the operator console on `/admin` (200) and still got the "no relationship" message on `/portal` (proving the two checks are independent). All test users, the temporary DB link, and the temporary `ADMIN_EMAILS` addition were removed afterward; `npm run db:seed` was re-run to restore clean seed state.
- The `findClientMembershipByClerkUserId` and `isAdminEmail` helpers were also verified directly (by construction) against the real local database and real env parsing via a throwaway probe script (`prisma/tmp-unit03-probe.ts`, deleted before commit): found/missing/unknown membership lookups and case-insensitive/whitespace-trimmed allowlist matching all behaved as expected.
- Two Clerk development-instance settings had to be changed to complete a real password sign-in through the hosted `<SignIn/>` component: `auth_password.device_trust.enabled` (a "verify this new device" email-code challenge) was toggled off only for the duration of the browser test and restored to `true` afterward; `organization_settings.force_organization_selection` was toggled off and left off, because it forced every signed-in user through an organization-setup screen that this project's org-free v1 design does not use (see Architecture Decisions).
- Unit 04 verification: `npm run typecheck` and `npm run build` pass; the build route summary lists `/admin/relationships`, `/admin/relationships/new`, `/admin/relationships/[id]`, and `/admin/relationships/[id]/edit` as dynamic routes. The `add_relationship_contact_and_client_user_status` migration applied cleanly via `npm run db:migrate` (non-interactive, no `migrate diff` workaround needed) and `npm run db:seed` remains deterministic (seed now fills the new contact fields and adds a `REMOVED`-status client user to exercise the status filter).
- Unit 04 live verification ran against a production `next start` on port 3210 (port 3000 is occupied by an unrelated process) with two disposable Clerk dev-instance test users (deleted afterward) and the admin allowlist supplied via an `ADMIN_EMAILS` shell override so the committed `.env.local` was untouched. Verified in a real browser session (gstack `/browse`): admin created a relationship through the form (redirects to the detail view; slug `unit04-verification-co` generated server-side), edited it, moved lifecycle `LEAD` to `DISCOVERY` (persisted in Postgres), attached the Clerk-backed test client by email (row stored the real Clerk user id), saw it listed, removed it (row flipped to `REMOVED`, kept for audit), and re-attached it (same row reactivated, no duplicate). Invalid submissions returned field errors without crashing: empty name, malformed contact email, unknown attach email, duplicate attach.
- Unit 04 access checks verified live: signed-out requests to all four new admin routes 307-redirect to `/sign-in`; the signed-in non-admin client user received 404 from `/admin`, `/admin/relationships`, the detail route, `/new`, and `/edit`; the same client user's `/portal` showed only their own relationship name. Server actions re-checking `isAdminEmail` before mutating is verified by construction (every action guards before touching Prisma). Device trust was again toggled off for the browser session and restored to `true` afterward; test DB rows were deleted and the database re-seeded.
- Unit 04 admin UI design direction (per `frontend-design-taste.md` derivation): grounded, legible, calm. Existing semantic tokens only; blue for structure and links, gold reserved for the primary action and lifecycle hex markers, silver hairlines on rectangular panels; Zilla Slab headings over Hanken Grotesk UI; the repeated layout primitive is the hairline-bordered rectangular panel with uppercase table headers, and the hex appears only as small lifecycle status markers. Light and dark themes plus 375px mobile were checked via screenshots.
- CodeRabbit rate-limited during Unit 04 committed review on `unit-04-client-relationship-core` at commit `26e5be2`. Reported reset delay: 16 minutes from first limit hit. Manual rerun required after reset.
- CodeRabbit rate-limited AGAIN during Unit 04 committed review at commit `b172fca` (2026-07-14 06:52 EDT / 10:52 UTC). The review suspended before completing — CodeRabbit reported "Review limit reached" and offered an **8-minute reset delay**. Partial findings were emitted before suspension. Manual action: wait for the reset, then re-run `coderabbit review --type committed --plain --base master` to obtain the complete finding set before merging Unit 04.
- CodeRabbit rate-limited again at commit `b5605b6`; offered a **17-minute reset delay** as of 2026-07-14. Loop paused; awaiting retry.
- Addressed sixth-pass Unit 04 review findings on commit `350df9b`: slug suffix ceiling, edit form remount key, disabled button hover handling, aria-invalid exposure, dynamic alert role, simplified contact rendering. Findings tracked and resolved in `context/current-issues.md`.
- Addressed seventh-pass CodeRabbit findings on commits `7e102de` and `c1e7f2c`: exported `SLUG_MAX_LENGTH` with collision-safe slug candidate generation, and retained submitted lifecycle value on failed `LifecycleControl` submit via `useActionState`. `context/current-issues.md` updated; `context/progress-tracker.md` aligned.
- CodeRabbit rate-limited again at commit `c1e7f2c`; offered a **12-minute reset delay**. Automatic retry queued (`proc_7e2afcddcc7e`). Loop resumes on completion.
- Addressed eighth-pass Unit 04 review on commit `fb23233`: narrowed slug-collision retry to `isUniqueConstraintError(error, "slug")` so unrelated `P2002` violations no longer burn retries. Next step: final coderabbit review to confirm clean status before PR/merge.
- Addressed ninth/tenth-pass findings on commit `a68d38b`: exact-candidate slug collision lookup via `findUnique` instead of broad `startsWith`, and aligned `.link-button--danger:disabled` with `pointer-events: none`.
- Addressed eleventh-pass finding on commit `35879ed`: remove membership buttons now carry contextual `aria-label` props for screen reader clarity. Final review in flight.
- CodeRabbit rate-limited again at commit `35879ed`; offered an **17-minute reset delay**. Automatic retry queued (`proc_9b493e36cc67`). Loop resumes on completion.
- Addressed twelfth-pass findings on commit `ec320bc`: extracted shared `relationshipDateFormatter` into `lib/relationships/format.ts`, added enum-order dependency comment in `queries.ts`, consolidated duplicate entries in `context/current-issues.md`. Final review queued.
- Addressed follow-up CodeRabbit findings: attach/remove actions now invalidate the relationships list as well as detail pages; lifecycle database failures retain the validated submitted lifecycle while invalid raw values remain untyped and fall back to the current value in the control; the attach email input remounts only after action-state changes so successful attaches clear it and errors retain it. Also replaced the Prisma create/update union cast with one shared writable-fields type and added CSS fallbacks for table `color-mix()` rules.
- Dependency security maintenance: refreshed the lockfile within existing semver ranges (Next 16.3.3, Prisma 7.10.0, and patched transitive dependencies) and pinned the Prisma config tree's `deepmerge-ts` override to 8.0.2. Local `npm audit` now reports zero vulnerabilities; the Dependabot alert count will update only after this branch is merged.
