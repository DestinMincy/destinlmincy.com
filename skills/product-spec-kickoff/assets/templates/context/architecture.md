# Architecture Context

## Current State

Describe what exists today.

## Target Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Undecided | Application framework |
| Data | Undecided | Durable product data |
| Auth | Undecided | Identity and access |

## System Boundaries

- `app/` or equivalent - Runtime application routes and screens.
- `components/` or equivalent - Reusable UI.
- `lib/` or equivalent - Business logic and integrations.
- `context/` - Product context and specs only.

## Data Model Boundaries

- Define ownership and relationships between major entities.

## Storage Model

- **Database**: Durable app-owned state.
- **File/Object Storage**: Generated files and uploads, if any.
- **External Providers**: Identity, payments, signing, messaging, or other owned external state.

## Auth And Access Model

- Public access rules.
- Authenticated access rules.
- Admin/operator access rules.

## Deployment Model

- Runtime hosting.
- Database hosting.
- Secret management.
- Backup/storage assumptions.

## Invariants

1. Hard rule the system must not violate.
2. Hard rule the system must not violate.
