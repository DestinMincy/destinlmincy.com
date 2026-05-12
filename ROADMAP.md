# destinlmincy.com — Roadmap

_Last updated: 2026-05-11_

## What this site is

A small agency / personal site for **Destin L. Mincy**. The business sells AI Agents-as-a-Service (AaaS) to small businesses. The first product, **ELATUM**, is an AI agent for short-term rental owners. Additional agents will follow and be featured on this site.

The site itself is a marketing site. It is not a client portal, app, or product surface. ELATUM lives at its own subdomain (`elatum.destinlmincy.com`) and the main site funnels visitors there for that specific offer.

## Current state

- `index.html` — static "Coming Soon" page (dark sci-fi aesthetic, Orbitron/Rajdhani fonts, neural-network canvas)
- `elatum/` — separate ELATUM landing page served at `elatum.destinlmincy.com`
- `img/` — image assets
- `PROJECT_PLAN.md` — **superseded by this doc; archive or delete**
- No build step, no framework, no backend

## Phase 1 — Marketing site MVP (target: 1–2 weeks)

Replace "Coming Soon" with a five-page Eleventy-built static site.

**Pages**
- `/` — Home
- `/about/` — Founder story + positioning
- `/services/` — What's offered, how engagement works
- `/work/` — Case studies index
  - `/work/elatum/` — Featured agent (links out to product subdomain)
- `/contact/` — Formspree-backed contact form

**Stack**
- Eleventy 3.x (static site generator)
- Plain HTML/CSS/JS — no React, no app routes
- Nunjucks templates with shared header/footer/canvas partials
- Formspree (`mqenwlvv`) for the contact form
- Hosting: S3 + CloudFront on existing AWS setup, current domain

**Definition of done**
- All five pages live with real copy (no Lorem)
- Contact form submits cleanly to Formspree and shows success/error states
- Lighthouse mobile ≥ 90 across Performance, Accessibility, Best Practices, SEO
- No console errors, no broken links, sitemap.xml + robots.txt published

## Phase 2 — Blog (target: ~2 weeks after Phase 1 ships)

- `/blog/` index with chronological post list
- Markdown-based posts under `src/blog/`
- RSS feed
- Per-post Open Graph images (simple template)
- Optional: tags, archive page

## Phase 3 — TBD

Open ideas, not commitments:
- Additional agent product pages as new offerings ship
- Lead magnets (templated agent playbook PDF, etc.)
- Newsletter signup wired to existing tool
- Analytics dashboard (Plausible or similar)
- Client testimonials section once there are clients

## What this site is **not** (and won't be in v1)

These were in the old PROJECT_PLAN.md and are intentionally out of scope:

- Auth / Cognito / sessions
- Client portal or project dashboard
- Quote/PDF generation
- Repository browser
- Admin CRUD
- Postgres / Prisma / any database
- Payment processing
- AI chat embed on the site itself

If any of these become real requirements later, they belong in a separate app, not in the marketing site repo.

## Operating principles

1. **Static first.** No server-rendered page goes in unless there's a concrete reason no static page can serve the use case.
2. **Ship before polish.** Get five pages live, then iterate.
3. **One thing per page.** Each page has one job and one primary CTA.
4. **The site funnels to products and contact, not into a logged-in surface.**
