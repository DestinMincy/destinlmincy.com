# Unit 02: Data Foundation

## Goal

Add the relational data foundation for the client relationship OS using a Dockerized local Postgres container for development and a migration path to RDS Postgres for production.

## Design

Do not provision RDS during development. The production target is RDS Postgres, but early work should run against a Dockerized local Postgres container to avoid cost before active client need.

## Implementation

### Database Setup

- Choose Prisma or Drizzle.
- Add Dockerized Postgres development instructions.
- Add a Docker Compose service for Postgres unless the Next.js foundation chooses an equivalent local container workflow.
- Use a named Docker volume so local database state persists across container restarts.
- Add environment variable contract for database URLs.
- Add migration workflow.
- Add seed strategy for local development.

### Baseline Schema

- Client relationships.
- Client relationship lifecycle enum.
- Client users referencing Clerk user IDs.
- Applications/sites.
- Projects.
- Contract template records and version shell.
- Payment gate shell.
- Subscription reference shell.
- Milestone and deliverable shell.

Keep initial schema narrow enough to support later units without filling in every field prematurely.

## Dependencies

- ORM selected during implementation.
- PostgreSQL driver.

## Verify When Done

- [ ] Dockerized Postgres starts locally.
- [ ] App database connection works against the Dockerized Postgres service.
- [ ] Initial migration applies cleanly.
- [ ] Seed data can create a client relationship with user, app/site, and project shell.
- [ ] Schema documents RDS as production target without provisioning it.
