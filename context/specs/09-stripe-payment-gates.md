# Unit 09: Stripe Payment Gates

## Goal

Add project/contract payment gates using manually attached Stripe invoice or payment-link metadata.

## Design

Project payments are custom contract-specific obligations. They are separate from recurring Clerk subscriptions.

## Implementation

### Payment Gate Model

- Attach payment gate to client relationship, project, and/or contract.
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

- [ ] Admin can attach a Stripe invoice/payment link to a project or contract.
- [ ] Payment gate status is visible to admin.
- [ ] Payment gate status is visible to the correct client.
- [ ] Required unpaid gate prevents project from being marked ready to start.
- [ ] Payment gate is not modeled as a subscription.
