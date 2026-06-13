# Code Standards

## General

- Keep modules small and single-purpose.
- Prefer existing project patterns over new abstractions.
- Validate external input at boundaries.
- Do not mix unrelated concerns in one component, route, or service.

## Language And Framework

- Define strictness, typing, routing, rendering, and file organization rules.

## Auth And Access

- Enforce protected data access server-side.
- Do not rely on hidden UI for authorization.

## Data And Storage

- Define where durable state belongs.
- Define migration rules.
- Define local development database rules.
- Define production database/storage rules.

## Integrations

- Verify webhooks/signatures when providers support them.
- Keep provider-specific code behind narrow helper modules.

## File Organization

- `context/` - Product context and specs.
- Add project-specific folders during planning.

## Verification

- Define the minimum check before a unit is complete.
