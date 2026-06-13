# Next.js Client Relationship OS Design

## Verdict

Build the site as a client relationship operating system, not as a subscription-first SaaS portal or a contract-only tool. The client relationship is the parent object. Contracts, payments, subscriptions, applications/sites, projects, milestones, approvals, and deliverables hang off it.

## Product Spine

V1 launches with:

- Public marketing site and blog.
- Clerk authentication.
- Admin client relationship hub.
- Multi-user client relationships with shared access.
- Admin-created applications/sites.
- Projects for scoped work on new or existing assets.
- App-owned block-based contract templates.
- DocuSign signing after app-owned PDF generation.
- Stripe invoice/payment-link tracking for custom project payments.
- Clerk-managed hosting and maintenance subscriptions.
- Client portal with contracts, payments, subscriptions, project milestones, approval actions, and link deliverables.

Deferred intentionally:

- Client-generated contracts.
- Multi-signer contract routing.
- Client roles and permission matrix.
- Client-requested app/site registration.
- Stripe API invoice/payment-link creation.
- File uploads.
- Messaging.
- Support tickets.
- Knowledge base.
- CMS-backed blog.
- Clerk organization model for admin access.

## Domain Model

Core entities:

- **Client Relationship**: parent business account. Lifecycle: lead, discovery, proposal, contracted, awaiting payment, active, paused, completed, archived.
- **Client User**: Clerk-backed user attached to a client relationship. V1 uses shared access; later roles become owner, billing contact, signer, viewer, approver.
- **Application/Site**: ongoing asset under a client. Can have hosting/maintenance subscriptions and can be modified by multiple projects over time.
- **Project**: scoped work effort: new build, feature, overhaul, migration, maintenance batch. May attach to an application/site or create a new one.
- **Contract Template**: database-managed block template with draft, published immutable versions, and archive.
- **Contract**: generated from a published template version with contract-specific fields. One designated client signer in v1, then admin countersignature.
- **Payment Gate**: Stripe invoice/payment-link metadata attached to contract/project terms. Manual attach in v1, Stripe API creation later.
- **Subscription**: Clerk-managed recurring service entitlement for hosting or maintenance, optionally tied to an application/site or project.
- **Milestone**: operational client-facing status unit with target date, status, update, deliverables, payment dependency, and approval flag.
- **Deliverable**: external link in v1. File uploads come later.

## Contract System

The app owns contract content and generation. DocuSign is only the signature transport.

Template lifecycle:

1. Draft.
2. Publish immutable version.
3. Archive when no longer usable.

V1 editor blocks:

- Heading.
- Paragraph.
- Clause.
- Variable.
- Table.
- Fee/payment schedule.
- Milestone list.
- Signature placeholder.

Variables:

- System variables for common fields.
- Template-level custom variables with schema, labels, types, defaults, and required flags.

Generated contracts:

- Reference a published template version.
- Use contract-specific field values.
- Can be regenerated from the same template/version and fields.
- Cannot be free-edited as documents.
- Generated and signed PDFs are stored in private S3.

Signing:

- Admin selects one designated client signer in v1.
- Client signs in DocuSign.
- Admin countersigns in DocuSign.
- Final signed PDF is archived in S3.

## Payments And Subscriptions

Project payments and subscriptions are separate.

Project payments:

- Use Stripe invoices/payment links.
- Support full upfront, 50% upfront, or contract-specific terms.
- V1 stores manually attached Stripe URL/ID/status metadata.
- Later version creates Stripe objects through the Stripe API.

Subscriptions:

- Use Clerk subscription/billing entitlements.
- Cover hosting and maintenance services.
- Multiple subscriptions can exist under one client relationship.
- Subscriptions may optionally attach to an application/site or project.
- Cancellation defaults to access through the paid period end.
- Admin override exists for edge cases and must be visible/logged.

## Client Portal V1

The portal shows enough to keep clients informed without dumping internal task noise.

Included:

- Contracts and signature status.
- Required payments and payment status.
- Hosting/maintenance subscriptions.
- Projects.
- Operational milestones.
- Link deliverables.
- Approve/request-changes workflow for milestones.

Milestones include:

- Title.
- Status.
- Target date.
- Client-facing update.
- Deliverable links.
- Payment dependency.
- Approval required flag.

Any client user can approve/request changes in v1. The app records actor and timestamp. Assigned approvers and deeper audit metadata come later.

## Admin Hub V1

The admin dashboard starts as a client relationship hub.

Primary sections:

- Client overview and lifecycle.
- Client users.
- Applications/sites.
- Projects.
- Contracts.
- Payment gates.
- Subscriptions.
- Milestones.
- Deliverables.

Admin creates applications/sites in v1. A client request workflow comes later.

## Architecture

Target stack:

- Next.js App Router with TypeScript.
- Clerk for auth and subscription entitlements.
- Stripe for custom project invoice/payment-link tracking.
- DocuSign for signing workflow.
- Dockerized local Postgres in development.
- RDS Postgres as production target when deployment/client need justifies cost.
- Private S3 bucket for generated and signed PDFs.
- EC2 for Next.js runtime.

Admin access starts with an email allowlist. Clerk organizations are unnecessary for a solo admin business and should wait until delegated operators exist.

## UI Direction

The visual direction is approachable, human, and trustworthy. The old cold sci-fi execution is retired: no Orbitron, no Rajdhani in the new app, no glowing neural canvas, no default generated SaaS tropes.

Typography is fixed:

- Display/headings: Zilla Slab, weight 600.
- Body/UI: Hanken Grotesk variable.
- Fonts are self-hosted from Fontsource WOFF2 files in the static font directory.
- Production must not load Google Fonts or any external font service.

The blue/gold/silver brand stays, recalibrated for warmth. Hex geometry remains the signature primitive, but dashboards stay rectangular and scannable with hex used only as markers, status, or icon accents.

## Verification Strategy

Each unit must be independently verifiable. Protected routes verify signed-out, wrong-user, and authorized behavior. Contract units verify immutability, generation, storage, and signature state. Payment units verify project payment gates do not get confused with recurring subscription entitlements.
