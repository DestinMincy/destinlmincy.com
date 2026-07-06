# Data Foundation

Unit 02 uses Prisma with standard PostgreSQL. Local development runs Postgres through Docker Compose. Production targets RDS Postgres later, but this unit does not provision RDS or any AWS database resource.

## Local Database

Start Postgres:

```powershell
docker compose up -d postgres
```

The Compose service uses a named volume, `destinlmincy_site_postgres_data`, so database state persists across container restarts.

Default local connection:

```text
postgresql://destinlmincy:destinlmincy_dev_password@127.0.0.1:5434/destinlmincy_dev?schema=public
```

Copy `.env.example` to `.env` for local development, or provide `DATABASE_URL` in the shell before running database commands.

## Commands

Generate the Prisma client:

```powershell
npm run db:generate
```

Create or apply a local development migration:

```powershell
npm run db:migrate -- --name init
```

Apply existing migrations in production or CI:

```powershell
npm run db:deploy
```

Seed local development data:

```powershell
npm run db:seed
```

Open Prisma Studio:

```powershell
npm run db:studio
```

## Production Target

Use RDS Postgres when deployment or client need justifies the cost. The production `DATABASE_URL` should point at the RDS instance and be supplied through the deployment environment or managed secret storage. Do not commit production credentials.

RDS provisioning, backup policy, SSL enforcement, and migration deployment automation belong to the EC2 deployment unit, not Unit 02.
