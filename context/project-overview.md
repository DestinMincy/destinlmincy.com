# destinlmincy.com

## Overview

`destinlmincy.com` is moving from an Eleventy marketing site into a Next.js React application for Destin L. Mincy's software and AI agency. The application is a client relationship operating system: public marketing and blog on the front, authenticated client portal and admin hub behind it.

The primary business object is the **client relationship**. Contracts, applications/sites, projects, payments, subscriptions, milestones, approvals, and deliverables all hang off that relationship.

Current repo fact: the site is still Eleventy/Nunjucks with static pages, dark sci-fi branding, Formspree contact handling, and S3/CloudFront deployment docs. The Next.js app has not been implemented yet.

## Goals

1. Replace the Eleventy site with a production-ready Next.js application without losing the current public marketing content.
2. Add a first-class blog that can be maintained in-repo before introducing a CMS.
3. Add Clerk authentication for public sign-in and protected client/admin areas.
4. Add client relationship management for admin operations.
5. Add app-owned contract template creation, publishing, generation, DocuSign signing, and signed-contract archive.
6. Add Stripe-backed custom project payment tracking through manual invoice/payment-link attachment first, with API creation later.
7. Add Clerk-managed hosting and maintenance subscriptions, optionally tied to projects or applications/sites.
8. Add client portal v1 with contracts, payment gates, subscriptions, project milestones, approvals, and link deliverables.
9. Deploy the Next.js runtime on AWS EC2 with S3 private document storage and a staged path to RDS Postgres.

## Core User Flows

### Public Visitor

1. Visitor lands on `/`.
2. Visitor reads positioning, services, work, or blog content.
3. Visitor contacts the business or signs in when already a client.

### Admin

1. Admin signs in through Clerk.
2. App verifies the admin email allowlist server-side.
3. Admin creates a client relationship and attaches client users.
4. Admin creates applications/sites and projects under the client relationship.
5. Admin creates or edits contract templates as drafts.
6. Admin publishes immutable contract template versions.
7. Admin generates a contract from a published version, designates one client signer, and sends it through DocuSign.
8. Client signs, admin countersigns, and the final signed PDF is archived to private S3.
9. Admin attaches Stripe invoice/payment-link metadata for required upfront project payments.
10. Admin activates or tracks hosting/maintenance subscriptions through Clerk entitlements.
11. Admin updates milestones, deliverables, and approval requirements.

### Client

1. Client user signs in through Clerk.
2. User lands in the client portal for their relationship.
3. User views contracts, signature status, required payments, active subscriptions, projects, milestones, and link deliverables.
4. User approves or requests changes on milestones when approval is required.
5. User retains subscription service access until the paid period ends after cancellation, unless admin override applies.

## Domain Model

- **Client Relationship**: parent business account. Lifecycle: lead, discovery, proposal, contracted, awaiting payment, active, paused, completed, archived.
- **Client User**: Clerk-backed user attached to a client relationship. V1 uses shared access; later roles become owner, billing contact, signer, viewer, approver.
- **Application/Site**: ongoing asset under a client. Can have hosting/maintenance subscriptions and can be modified by multiple projects over time.
- **Project**: scoped work effort: new build, feature, overhaul, migration, maintenance batch. May attach to an application/site or create a new one.
- **Contract Template**: database-managed block template with draft, published immutable versions, and archive.
- **Contract**: generated from a published template version with contract-specific fields. One designated client signer in v1, then admin countersignature.
- **Payment Gate**: Stripe invoice/payment-link metadata attached to contract/project terms. Manual attach in v1, Stripe API creation later.
- **Subscription**: Clerk-managed recurring service entitlement for hosting or maintenance, optionally tied to an application/site or project.
- **Milestone**: operational client-facing status unit with target date, status, update, deliverables, payment dependency, and approval flag.
- **Deliverable**: external link in v1. File uploads are intentionally deferred.

## Features

### Public Site

- Home, about, services, work/case-study, and contact pages migrated from the current site.
- Public blog index, post pages, metadata, sitemap, and RSS.
- SEO and Open Graph support at least matching the existing static site.

### Authentication And Access

- Clerk-powered sign-in, sign-up, user profile, and sessions.
- V1 admin access through explicit email allowlist.
- Client users can belong to client relationships.
- V1 client users share portal access. Role-based client permissions come later.

### Contract System

- App-owned block-based template editor.
- Blocks in v1: heading, paragraph, clause, variable, table, fee/payment schedule, milestone list, signature placeholder.
- System variables plus template-level custom variables.
- Draft, publish, and archive lifecycle.
- Published versions are immutable.
- Generated contracts can be regenerated from the selected template/version with contract-specific fields, but not free-edited as documents.
- Generated and signed PDFs are stored in a private S3 bucket.
- DocuSign is used for signature workflow only.

### Payments And Subscriptions

- Stripe invoices/payment links handle custom project payments: full upfront, 50% upfront, or contract-specific payment terms.
- V1 attaches Stripe invoice/payment-link metadata manually.
- Later version can create Stripe payment links/invoices through the Stripe API.
- Clerk handles hosting and maintenance subscriptions.
- Client relationships can have multiple subscriptions, each optionally tied to an application/site or project.
- Canceled subscriptions provide access through the current paid period by default; admin override exists for edge cases.

### Client Portal

- Contracts and signature status.
- Required project payments and payment status.
- Hosting and maintenance subscriptions.
- Projects and operational milestones.
- Link deliverables.
- In-app approve/request-changes workflow for milestones, recording actor and timestamp.
- No messaging or support tickets in v1.

### Admin Hub

- Client relationship hub as the primary admin view.
- Tabs/sections for client users, applications/sites, projects, contracts, payment gates, subscriptions, milestones, deliverables, and lifecycle state.
- Admin creates applications/sites in v1.
- Future client request flow can allow clients to request app/site registration.

## Scope

### In Scope For V1

- Next.js React application migration.
- TypeScript application foundation.
- Local Postgres development database.
- RDS Postgres production target, provisioned only when deployment/client need justifies cost.
- Private S3 document storage for generated/signed contracts.
- Clerk authentication and subscription entitlement integration.
- Stripe manual invoice/payment-link attachment for project payment gates.
- DocuSign signature flow integration.
- Blog implementation.
- Client relationship admin hub.
- Client portal core: contracts, payments, subscriptions, milestones, approvals, deliverable links.
- EC2 runtime deployment plan and deploy scripts/configuration.

### Deferred

- Client-generated contracts. This is intentionally never planned.
- Multi-signer contract flow.
- Client user roles and permission matrix.
- Client-requested app/site registration.
- Stripe API invoice/payment-link creation.
- File uploads for deliverables.
- Project-tied messaging.
- Support tickets.
- Knowledge base.
- CMS-backed blog.
- Multi-admin Clerk organization model.

## Success Criteria

1. Public marketing pages and blog build under Next.js with no broken primary navigation.
2. Clerk auth protects client and admin areas.
3. Admin access is restricted through server-side email allowlist.
4. Admin can manage client relationships, client users, applications/sites, and projects.
5. Admin can create, publish, archive, and use versioned contract templates.
6. Admin can send generated contracts through DocuSign and archive signed PDFs in private S3.
7. Admin can attach Stripe invoice/payment-link records to payment gates.
8. Client portal shows contracts, payments, subscriptions, milestones, approvals, and deliverable links.
9. Subscription service access follows Clerk entitlement state with period-end cancellation behavior and admin override.
10. The app can be built and run on EC2 behind HTTPS with documented environment variables and process management.
