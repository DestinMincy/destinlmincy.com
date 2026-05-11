# destinlmincy.com

Marketing site for Destin L. Mincy — AI Agents-as-a-Service for small businesses. Featured product: **ELATUM**, the AI co-host for short-term rentals.

See `ROADMAP.md` for current scope and what's intentionally out.

## Stack

- [Eleventy 3.x](https://www.11ty.dev/) — static site generator
- Nunjucks templates, plain CSS, no client-side framework
- [Formspree](https://formspree.io/) for the contact form (form ID `mqenwlvv`)
- Hosting: AWS S3 + CloudFront

## Local development

```bash
npm install
npm start
# → http://localhost:8080
```

## Build

```bash
npm run build
# → outputs to _site/
```

## Deploy (AWS)

The `deploy` script syncs `_site/` to S3 and invalidates the CloudFront distribution.

1. Edit `package.json` and replace `YOUR_BUCKET_NAME` and `YOUR_DISTRIBUTION_ID`.
2. Configure AWS credentials locally (`aws configure` or env vars).
3. Run:

```bash
npm run deploy
```

You can also wire this to GitHub Actions later — see `.github/workflows/deploy.yml` (TBD).

## Structure

```
src/
  _data/site.json         ← site-wide variables
  _includes/
    layouts/base.njk      ← outer HTML shell
    partials/             ← header, footer
  styles/main.css         ← all styles
  scripts/                ← canvas animation, etc.
  img/                    ← static images
  index.njk               ← home
  about.njk
  services.njk
  contact.njk
  work/
    index.njk             ← case studies list
    elatum.njk            ← ELATUM case study (links out to product subdomain)
  robots.txt
  sitemap.njk
```

## Assets to migrate from the current `index.html`

Pull these out of the existing static page and drop into the new structure:

- The neural-network canvas script → `src/scripts/neural-canvas.js`
- Site styles (Orbitron/Rajdhani, color tokens, hex badge) → `src/styles/main.css`
- Logo SVG → `src/img/logo.svg`
- Favicon → `src/img/favicon.svg`

## What this site is not

A client portal. A web app. A backend. See `ROADMAP.md`.
