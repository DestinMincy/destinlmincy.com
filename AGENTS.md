# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is a Next.js 14 (App Router) + Refine + Ant Design monolith that serves as a portfolio website and client management platform. See `README.md` and `PROJECT_PLAN.md` for full details.

### Required services

| Service | How to start | Notes |
|---------|-------------|-------|
| PostgreSQL | `docker compose up -d` (from repo root) | Exposed on port 5433, credentials: `dlm`/`simplepass`, db: `destinlmincy_com_db` |
| Next.js dev server | `npm run dev` | Port 3000 |

### Database setup

The Prisma schema (`prisma/schema.prisma`) is the source of truth. The existing migration SQL in `prisma/migrations/` is **outdated** — it uses `Customer`/`customerId` naming while the schema now uses `Client`/`clientId`.

For development, use:
```
npx prisma db push --force-reset
```
This syncs the DB schema directly from the Prisma schema. Do NOT use `npx prisma migrate deploy` — the migration file doesn't match the current schema.

### Environment variables

Copy `.env.example` to `.env` and set at minimum:
- `DATABASE_URL=postgresql://dlm:simplepass@localhost:5433/destinlmincy_com_db`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=<any-string>`

All AWS/third-party integrations (Cognito, S3, OpenAI, etc.) degrade gracefully with placeholder values.

### Admin login

Hardcoded credentials: username `admin`, password `admin` (configured in `src/lib/auth.ts`).

### Key commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Unit/integration tests | `npm test` |
| E2E tests (Playwright) | `npx playwright test` |
| Prisma generate | `npx prisma generate` |
| Prisma push schema | `npx prisma db push` |

### Known issues

- The Jest config picks up Playwright e2e tests (`e2e/*.spec.ts`) causing those suites to fail in `npm test`. The API test suites pass.
- The `__tests__/page.test.tsx` fails because it tries to render an async Server Component directly.
- The admin Projects list page has a frontend bug (`rawData.some is not a function`) related to Refine's simple-rest data provider expecting array responses, but project creation and the API routes work correctly.
- ESLint reports pre-existing issues (unescaped entities in JSX, `<img>` instead of `next/image`).
