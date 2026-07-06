# Unit 11: Project Milestones And Deliverables

## Goal

Add client-facing operational milestones, approval actions, payment dependencies, and link deliverables.

## Design

Milestones give clients enough visibility without exposing internal task noise. Deliverables are links only in v1 to avoid storage/security cost.

## Implementation

### Milestones

- Create milestones under projects.
- Fields: title, status, target date, client-facing update, payment dependency, approval required.
- Status options should be concise: planned, active, blocked, ready for review, approved, complete.

### Approvals

- Any client user in the relationship can approve or request changes in v1.
- Record actor and timestamp.
- Require a note for request changes.
- Store approval/request-change history.

### Deliverables

- Add link deliverables under milestones or projects.
- Fields: label, URL, type, notes, visibility.
- No file uploads in v1.

## Dependencies

- Projects.
- Payment gates.
- Client users.

## Verify When Done

- [ ] Admin can create and update milestones.
- [ ] Milestones can reference payment dependency.
- [ ] Client can approve a milestone.
- [ ] Client can request changes with a note.
- [ ] Approval action records actor and timestamp.
- [ ] Admin can add link deliverables.
