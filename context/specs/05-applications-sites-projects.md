# Unit 05: Applications/Sites And Projects

## Goal

Add applications/sites and projects as separate domain objects under client relationships.

## Design

Applications/sites are ongoing assets. Projects are scoped work efforts. This separation matters because a project may create a new app/site or modify an existing one.

## Implementation

### Applications/Sites

- Admin can create, edit, list, and archive applications/sites under a client relationship.
- Include type: website, web application, internal tool, other.
- Include operational fields: production URL, staging URL, repository URL, notes.
- Clients cannot create applications/sites in v1.

### Projects

- Admin can create, edit, list, and archive projects under a client relationship.
- Project can optionally attach to an existing application/site.
- Project can indicate whether it creates a new asset.
- Include status, summary, start/target dates, and client-facing description.

## Dependencies

- Client relationship core.

## Verify When Done

- [ ] Admin can create app/site records under a client.
- [ ] Admin can create projects under a client.
- [ ] Project can attach to an existing app/site.
- [ ] Client can view relevant apps/sites and projects read-only if exposed.
- [ ] Client cannot create apps/sites or projects.
