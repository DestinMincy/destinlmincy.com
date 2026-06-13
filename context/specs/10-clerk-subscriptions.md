# Unit 10: Clerk Subscriptions

## Goal

Add hosting and maintenance subscription visibility and entitlement modeling through Clerk.

## Design

Subscriptions represent ongoing service access. They are not the same as project payment gates. A client relationship can have multiple subscriptions, each optionally tied to an application/site or project.

## Implementation

### Subscription Model

- Reference Clerk subscription/customer identifiers.
- Classify service category: hosting, maintenance, other future category.
- Optionally attach subscription to application/site or project.
- Track entitlement status, current period end, canceled state, and admin override.

### Access Rules

- Default cancellation behavior: service access continues until paid period end.
- Admin override can extend or cut off access for edge cases.
- Overrides must be visible and logged.

### Client/Admin UI

- Admin sees subscriptions under client relationship and related app/site/project.
- Client sees active, canceling, ended, and overridden subscription status.

## Dependencies

- Clerk auth/access.
- Client relationship core.
- Applications/sites and projects.

## Verify When Done

- [ ] Client relationship can have multiple subscriptions.
- [ ] Subscription can attach to an application/site or project.
- [ ] Cancellation keeps access until period end by default.
- [ ] Admin override changes access outcome and is visible.
- [ ] Subscription entitlement checks use trusted server-side Clerk data.
