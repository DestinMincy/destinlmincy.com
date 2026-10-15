# Unit 16: Legacy Cleanup

## Goal

Remove or archive Eleventy-only code after the Next.js application is verified.

## Design

Cleanup should reduce confusion without destroying useful assets or copy. The old site is a source of content and brand material until the new app is live.

## Implementation

### Remove Or Archive

- Remove obsolete Eleventy scripts and dependencies.
- Remove or archive `src/` Nunjucks templates after migrated routes are verified.
- Remove `_site/` generated output from consideration.
- Update `README.md`, `ROADMAP.md`, and deployment docs for the new app.

### Preserve

- Preserve reusable images, logos, copy, and brand tokens.

## Dependencies

- Completed and verified Next.js app.
- Completed deployment documentation.

## Verify When Done

- [x] `npm run build` passes for the Next.js app (required fixing the `docusign-esign` bundling failure first).
- [x] No Eleventy commands remain in `package.json`; `@11ty/eleventy` and `rimraf` were uninstalled, `.eleventy.js`, `src/`, root `index.html`, and `DEPLOY_AWS.md` were removed.
- [x] README and roadmap describe the current architecture; `docs/deployment.md` is the deployment guide.
- [x] Useful assets were preserved under `public/img/brand/` (logo PNG/SVG variants, banners, wallpapers, ELATUM lockup, apple touch icon). Duplicates already in `public/img/` were dropped. Legacy color tokens stay recorded in `context/ui-context.md`.
