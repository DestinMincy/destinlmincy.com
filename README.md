# destinlmincy.com

Public site, blog, admin client hub, and client portal for Destin L. Mincy's software and AI agency. The application is a client relationship operating system: marketing and blog on the front, Clerk-authenticated admin and client surfaces behind it.

The product and architecture are documented under `context/`. Start with `context/project-overview.md`, then `context/architecture.md`. Unit specs live in `context/specs/`. The current state of the build is tracked in `context/progress-tracker.md`.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js App Router, React, TypeScript (strict) |
| Auth | Clerk (sessions, sign-in, email-allowlist admin gate, Billing entitlements) |
| Data | PostgreSQL via Prisma (Docker locally, RDS when justified) |
| Documents | `@react-pdf/renderer` for contract PDFs, private S3 for storage |
| Signatures | DocuSign (JWT auth, anchor tabs, Connect webhook) |
| Payments | Stripe invoices and payment links, attached manually to payment gates |
| Blog | Markdown files under `content/blog/` |
| Runtime | Node.js on EC2 behind Nginx, managed by PM2 |

## Local development

Requirements: Node.js 22, Docker.

```bash
npm install
cp .env.example .env.local
cp .env.example .env            # Prisma CLI reads .env
docker compose up -d            # Postgres on 127.0.0.1:5434
npm run db:migrate
npm run db:seed
npm run dev                     # http://localhost:3000
```

Fill in Clerk keys and `ADMIN_EMAILS` in `.env.local` before signing in. `ADMIN_EMAILS` is the only thing standing between a signed-in user and `/admin`, so never commit it. See `docs/data-foundation.md` for the database workflow and `.env.example` for every variable with notes on which unit needs it.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | `prisma generate` then `next build` |
| `npm run start` | Production server |
| `npm run typecheck` | Prisma client, Next route types, `tsc --noEmit` |
| `npm test` | Unit tests (`node:test` via `tsx`, mocked Prisma) |
| `npm run test:integration` | Postgres-backed query tests (needs `DATABASE_URL`) |
| `npm run test:e2e` | Playwright end-to-end suite |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:deploy` | Apply committed migrations (production) |
| `npm run db:seed` | Deterministic local seed data |
| `npm run db:studio` | Prisma Studio |

## Repository layout

- `app/` routes, layouts, route handlers (`/`, `/blog`, `/portal`, `/admin`, `/api/webhooks/docusign`)
- `components/` shared UI and admin form components
- `lib/` server utilities: auth, contracts, DocuSign, PDF, storage, payment gates, milestones, portal queries
- `prisma/` schema, migrations, seed
- `content/blog/` blog posts
- `public/` fonts, images, preserved brand assets under `public/img/brand/`
- `context/` product, architecture, workflow, design rules, unit specs
- `docs/` data foundation and EC2 deployment runbook
- `__tests__/` unit tests, `tests/e2e/` Playwright

## Deployment

The production runbook is `docs/deployment.md`: EC2 instance setup, Nginx and PM2 configuration, environment variables, migrations, rollback, and the DNS cutover from the retired static site.

## History

The site began as an Eleventy static site deployed to S3 and CloudFront. That source was removed in Unit 16 once the Next.js routes replaced it. Brand assets from the old site were kept under `public/img/brand/`.

## License

See `LICENSE` and `COMMONS_CLAUSE`.
