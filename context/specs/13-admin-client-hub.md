# Unit 13: Admin Client Hub

## Goal

Assemble the admin dashboard around the client relationship hub with tabs/sections for operational control.

## Design

Admin v1 should be dense, clear, and relationship-centered. Avoid four disconnected dashboards. Start from the client and show the operational surface around that client.

## Implementation

### Admin Shell

- Client relationship list.
- Client relationship detail page.
- Tabs/sections: overview, users, applications/sites, projects, contracts, payments, subscriptions, milestones, deliverables.
- Lifecycle state controls.
- High-signal blockers/actions summary.

### Operations

- Show contracts waiting on client signature/admin countersignature.
- Show payment gates blocking work.
- Show subscriptions ending or overridden.
- Show milestones needing update or approval.

## Dependencies

- All domain units used in the hub.

## Verify When Done

- [ ] Admin can navigate all relationship sections from one hub.
- [ ] Admin sees blockers/actions for a client relationship.
- [ ] Non-admin users cannot access admin hub.
- [ ] Hub remains usable at desktop widths.
