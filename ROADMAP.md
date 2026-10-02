# destinlmincy.com Roadmap

This file is the short public-facing view. The authoritative plan is `context/specs/00-build-plan.md`, and live status is in `context/progress-tracker.md`.

## What this is

A Next.js application for Destin L. Mincy's software and AI agency. It serves the public marketing site and blog, and behind Clerk authentication it runs the agency: client relationships, applications and sites, projects, contract templates and generated contracts, DocuSign signing, Stripe payment gates, Clerk-managed hosting and maintenance subscriptions, milestones with client approvals, and link deliverables. One admin, many client relationships, each with one or more client users.

## Delivered

- Public site: home, about, services, work, contact, blog with RSS and sitemap.
- Clerk auth with a server-side email allowlist for `/admin` and relationship membership checks for `/portal`.
- Admin hub per client relationship: users, applications and sites, projects, contract templates (draft, published immutable versions, archive), generated contract PDFs in private S3, DocuSign send and webhook status tracking, payment gates, subscriptions, milestones, deliverables.
- Client portal: contracts and signature status, payments with Stripe pay links, subscriptions with entitlement checks, projects and milestones, approve or request changes on milestones, link deliverables.
- Payment gates can block a project from starting until a required payment is paid or waived.
- EC2 deployment runbook with Nginx and PM2 configuration.
- Legacy Eleventy site removed.

## Pending verification

Code is complete for every planned unit. These need a live run with real credentials before launch:

- DocuSign JWT consent, end-to-end signing, and Connect webhook delivery.
- S3 IAM permissions for contract PDF upload and download.
- Clerk Billing entitlement keys against real subscriptions.
- Production migrations and environment variables on the EC2 host.

## Deferred by design

- Stripe API creation of invoices and payment links (manual attachment ships first).
- Client user roles and permissions.
- Multi-signer contracts.
- Client-requested application or site registration.
- File uploads for deliverables.
- Messaging, support tickets, knowledge base.
- CMS-backed blog.
- Clerk organizations for multi-admin.

Client-generated contracts are intentionally never planned.
