# Unit 12: Client Portal V1

## Goal

Assemble the client-facing portal around the relationship: contracts, payments, subscriptions, projects, milestones, approvals, and deliverable links.

## Design

The portal should be calm and operational. It should answer: what is active, what needs my action, what is blocked, what has been delivered, and what am I paying for?

## Implementation

### Portal Shell

- Client relationship overview.
- Current action items.
- Contracts section.
- Payments section.
- Subscriptions section.
- Projects section.
- Milestones and approvals.
- Deliverable links.

### Access Control

- Signed-in Clerk user must belong to the relationship.
- Client users only see their relationship data.
- Shared access in v1; roles later.

## Dependencies

- Clerk auth/access.
- Client relationship core.
- Contracts.
- Payment gates.
- Subscriptions.
- Milestones/deliverables.

## Verify When Done

- [ ] Signed-out user cannot access portal.
- [ ] Client user cannot access another relationship.
- [ ] Client sees contracts and statuses.
- [ ] Client sees required payments.
- [ ] Client sees subscriptions.
- [ ] Client can approve/request changes where allowed.
- [ ] Portal works at mobile and desktop widths.
