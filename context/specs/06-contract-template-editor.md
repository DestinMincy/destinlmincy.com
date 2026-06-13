# Unit 06: Contract Template Editor

## Goal

Add app-owned, database-managed contract templates with a block-based editor, variables, draft/publish/archive lifecycle, and immutable published versions.

## Design

Contracts are legal/business documents, so template versioning and immutability are required. The editor should be modular and controlled, not a free-form document processor.

## Implementation

### Template Lifecycle

- Create template draft.
- Edit template draft.
- Publish immutable template version.
- Archive template or version to prevent future use without deleting history.

### Block Editor

V1 block types:

- Heading.
- Paragraph.
- Clause.
- Variable.
- Table.
- Fee/payment schedule.
- Milestone list.
- Signature placeholder.

### Variables

- Provide system variables for common fields.
- Allow template-level custom variables with type, label, required flag, and default value.
- Validate that all required variables are supplied before contract generation.

## Dependencies

- Data foundation.
- Admin auth/access.
- UI component primitives.

## Verify When Done

- [ ] Admin can create and edit a draft template.
- [ ] Admin can define custom variables.
- [ ] Admin can publish an immutable version.
- [ ] Published versions cannot be mutated.
- [ ] Archived templates/versions cannot be used for new contracts.
