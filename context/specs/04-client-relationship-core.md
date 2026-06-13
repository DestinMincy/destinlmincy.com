# Unit 04: Client Relationship Core

## Goal

Add admin-managed client relationships and client users as the primary business objects.

## Design

The admin experience should start from the client relationship, not contracts, projects, or subscriptions. V1 supports multiple client users with shared access. Client roles come later.

## Implementation

### Client Relationships

- Create, edit, list, and view client relationships in admin.
- Support lifecycle states: lead, discovery, proposal, contracted, awaiting payment, active, paused, completed, archived.
- Add basic relationship metadata: name, company/legal name, primary contact info, notes/status summary.

### Client Users

- Attach Clerk users to a client relationship.
- List client users under a relationship.
- Remove/deactivate relationship membership.
- V1 shared access; no client roles yet.

## Dependencies

- Data foundation.
- Clerk auth/access.

## Verify When Done

- [ ] Admin can create and view client relationships.
- [ ] Admin can attach at least one Clerk-backed client user.
- [ ] Client relationship lifecycle can be updated.
- [ ] Non-admin users cannot access admin relationship management.
- [ ] Client users can only access their own relationship data.
