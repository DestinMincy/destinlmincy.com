# Unit 03: Clerk Auth And Access

## Goal

Add Clerk authentication and the first server-side access rules for public, client, and admin areas.

## Design

Use Clerk-provided auth UI unless custom auth screens are explicitly justified. Admin access starts with an email allowlist because this is a solo-admin business. Clerk organizations are deferred.

## Implementation

### Clerk Setup

- Add Clerk SDK for Next.js.
- Configure provider/layout integration.
- Document required environment variables.
- Add sign-in and sign-up routes or Clerk components according to current Clerk guidance.

### Access Rules

- Public routes remain readable signed out.
- Client portal route requires signed-in Clerk user attached to a client relationship.
- Admin route requires signed-in Clerk user whose email is in the admin allowlist.
- Access checks must happen server-side.

## Dependencies

- Clerk Next.js SDK.
- Data foundation for client relationship membership checks.

## Verify When Done

- [ ] Signed-out users cannot access client portal routes.
- [ ] Signed-in users without relationship membership cannot access client relationship data.
- [ ] Signed-in non-admin users cannot access `/admin`.
- [ ] Allowlisted admin can access `/admin`.
- [ ] Public routes remain accessible signed out.
- [ ] Required Clerk environment variables are documented.
