# Build Plan

## Objective

Describe the product build objective.

## Unit Sequence

1. `01-foundation.md` - Establish the project foundation.

Add units during planning. Each unit should be independently verifiable.

## Ordering Rationale

- Foundation before features.
- Data contracts before UI wiring when data matters.
- Auth/access before protected features.
- External integrations after local domain model.
- Deployment after a production build path exists.
- Cleanup last.

## Verification Strategy

- Each unit must produce a visible, testable, or queryable result.
- Protected features must verify signed-out, unauthorized, and authorized behavior.
- Integration units must verify failure states and credential boundaries.
