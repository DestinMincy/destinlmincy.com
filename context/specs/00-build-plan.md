# Build Plan

## Objective

Move `destinlmincy.com` from the current Eleventy static site to a Next.js client relationship OS with public marketing/blog, Clerk auth, admin client hub, client portal, app-owned contract generation, DocuSign signatures, Stripe project payment gates, Clerk subscriptions, and EC2 deployment.

## Unit Sequence

1. `01-next-foundation.md` - Create the Next.js TypeScript foundation and migrate enough public site structure to prove routing, styling, and metadata.
2. `02-data-foundation.md` - Add Dockerized local Postgres development setup, ORM choice, schema baseline, migrations, and seed strategy.
3. `03-clerk-auth-access.md` - Add Clerk auth, admin email allowlist, and server-side protected route structure.
4. `04-client-relationship-core.md` - Add admin-managed client relationships, lifecycle state, and client users.
5. `05-applications-sites-projects.md` - Add applications/sites and projects as separate but related domain objects.
6. `06-contract-template-editor.md` - Add database-managed block-based contract template drafts, variables, publish/archive lifecycle, and immutable versions.
7. `07-contract-generation-storage.md` - Generate contract PDFs from published template versions and store generated PDFs in private S3.
8. `08-docusign-signature-flow.md` - Send generated PDFs to DocuSign, track signer/countersigner flow, and archive final signed PDFs.
9. `09-stripe-payment-gates.md` - Add manual Stripe invoice/payment-link attachment for contract/project payment gates.
10. `10-clerk-subscriptions.md` - Add hosting and maintenance subscription visibility and entitlement modeling through Clerk.
11. `11-project-milestones-deliverables.md` - Add operational milestones, approval actions, payment dependencies, and link deliverables.
12. `12-client-portal-v1.md` - Assemble the client-facing portal around contracts, payments, subscriptions, milestones, approvals, and deliverables.
13. `13-admin-client-hub.md` - Assemble the admin relationship hub with tabs/sections for operational control.
14. `14-blog.md` - Add repo-managed blog content, rendering, RSS, sitemap, and metadata.
15. `15-ec2-deployment.md` - Add EC2 production deployment documentation and scripts/config.
16. `16-legacy-cleanup.md` - Remove or archive Eleventy-only code once the Next.js app is verified.

## Ordering Rationale

- Framework foundation comes first.
- Data foundation comes before relationship-dependent feature work.
- Auth and access control come before protected data surfaces.
- Client relationships come before contracts, payments, subscriptions, and projects.
- Applications/sites are separate from projects because projects may work on existing assets.
- Contract templates come before generated contracts.
- Generated contracts come before DocuSign.
- Project payment gates and subscriptions are separate units because they use different providers and business rules.
- Portal/admin assembly happens after the underlying domain units exist.
- Deployment comes after the app has a real production build path.
- Legacy cleanup happens last to avoid destroying working site assets during migration.

## Verification Strategy

- Each unit must produce a visible, testable, or queryable result.
- Every protected route unit must verify signed-out, wrong-user, and authorized behavior.
- Contract units must verify template immutability and generated-document traceability.
- Payment units must verify project payment gates do not get confused with recurring subscriptions.
- Portal units must verify client relationship access server-side.
- Deployment work must verify production build and start commands locally before EC2 rollout.
