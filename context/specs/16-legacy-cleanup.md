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
- Preserve `elatum/` unless explicitly scoped into the migration.

## Dependencies

- Completed and verified Next.js app.
- Completed deployment documentation.

## Verify When Done

- [ ] `npm run build` passes for the Next.js app.
- [ ] No Eleventy commands remain as primary scripts.
- [ ] README and roadmap describe the current architecture.
- [ ] Useful assets were preserved.
