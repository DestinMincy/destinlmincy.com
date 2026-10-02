# Unit 09: Stripe Payment Gates

## Goal

Add project/contract payment gates using manually attached Stripe invoice or payment-link metadata.

## Design

Project payments are custom contract-specific obligations. They are separate from recurring Clerk subscriptions.

## Implementation

### Payment Gate Model

- Attach payment gate to the contract it belongs to.
- Support payment type: full upfront, deposit, milestone payment, other.
- Store amount, currency, due date, required-before-work flag, Stripe URL, Stripe invoice/payment-link ID if available, and status.

### Manual Attachment

- Admin creates payment record and pastes Stripe invoice/payment-link details.
- Admin can update status manually in v1.
- Include fields needed for later Stripe API automation.

### Client Visibility

- Client portal can show payment required, paid, overdue, or waived.
- Work-start gate can depend on required payment status.

## Dependencies

- Client relationship core.
- Projects.
- Contracts.

## Verify When Done

- [x] Admin can attach a Stripe invoice/payment link to a payment gate, at creation or later through the edit page. Gates attach to the relationship and optionally a project; linking a gate to a specific contract record is not modeled in v1 (see progress tracker open questions).
- [x] Payment gate status is visible to admin (list, project page, relationship hub action items).
- [x] Payment gate status is visible to the correct client (portal payments page, membership-checked server-side; shows amount, due date, derived overdue, and the Stripe link while open).
- [x] Required unpaid gate prevents project from moving into ACTIVE or IN_PROGRESS (`lib/client-work/project-writes.ts`, unit-tested).
- [x] Payment gate is not modeled as a subscription (`PaymentGate` and `SubscriptionReference` are separate models).

Live verification still required: paste a real Stripe invoice or payment link URL and confirm the client can open it from the portal.
