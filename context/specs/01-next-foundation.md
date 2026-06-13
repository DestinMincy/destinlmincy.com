# Unit 01: Next.js Foundation

## Goal

Create the Next.js React TypeScript application foundation without implementing auth, database-backed features, billing, contracts, or dashboards. Preserve the current public brand direction and enough public routes to prove the app shell works.

## Design

Use the existing dark technical brand tokens as the starting point. Public pages may keep the expressive atmosphere, but the layout should be built in Next.js-native components rather than copied as raw Nunjucks.

Avoid AI-template visual tropes during the migration: no decorative gradient blobs, generic purple/blue gradient washes, glassmorphism panels, glow-heavy filler, or bento-card decoration. Preserve brand atmosphere through tokens, typography, spacing, angular geometry, and real content. Gradients require a specific functional or brand reason.

## Implementation

### App Foundation

- Add Next.js App Router with TypeScript strict mode.
- Add root layout, metadata defaults, public header, and footer.
- Add global CSS/token setup from the existing brand.
- Add clear npm scripts for dev, build, start, lint/typecheck if selected.
- Migrate enough public routes to prove navigation: `/`, `/about`, `/services`, `/work`, `/contact`.

### Asset Handling

- Move reusable public assets into `public/` or an equivalent Next-safe location.
- Preserve current logo, favicon, Open Graph image, and key brand images.

### Legacy Handling

- Do not delete Eleventy files in this unit unless the migration path is fully verified.
- Make the intended development/build commands unambiguous.

## Dependencies

- `next`
- `react`
- `react-dom`
- `typescript`
- Styling dependencies only if selected during implementation.

## Verify When Done

- [ ] `npm run dev` starts the Next.js app.
- [ ] `npm run build` passes.
- [ ] Public navigation works for migrated routes.
- [ ] Metadata exists for the home page.
- [ ] Public shell avoids generic AI/SaaS visual tropes and does not rely on decorative gradients.
- [ ] Existing unrelated working-tree changes are preserved.
