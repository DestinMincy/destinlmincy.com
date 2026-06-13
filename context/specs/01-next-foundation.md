# Unit 01: Next.js Foundation

## Goal

Create the Next.js React TypeScript application foundation without implementing auth, database-backed features, billing, contracts, or dashboards. Preserve the current public brand direction and enough public routes to prove the app shell works.

## Design

Follow the committed design direction in `context/ui-context.md`: an approachable, human, trustworthy evolution of the blue/gold/silver brand. Keep the palette (recalibrated for warmth), retire Orbitron, and make the hexagon the signature integrated motif rather than a neural-canvas background. Ship light and dark mode as first-class themes from the start, built on semantic theme-resolved tokens. Build the layout in Next.js-native components rather than copying raw Nunjucks. Do not carry the cold sci-fi glow/canvas execution forward.

`context/frontend-design-taste.md` is the authority on visual design and UI copy for this work. Avoid AI-template visual tropes during the migration: no decorative gradient blobs, generic purple/blue gradient washes, glassmorphism panels, glow-heavy filler, or bento-card decoration. Carry brand recognition through the recalibrated tokens, the hex mark, typography, spacing, and real content rather than atmosphere. Gradients require a specific functional or brand reason.

## Implementation

### App Foundation

- Add Next.js App Router with TypeScript strict mode.
- Add root layout, metadata defaults, public header, and footer.
- Add global CSS/token setup using semantic, theme-resolved tokens (surface, text, border, accent, signal, etc.), recalibrated from the existing brand per `context/ui-context.md`.
- Add light and dark mode as first-class themes from the start: initialize from `prefers-color-scheme`, expose a persisted toggle, and prevent a flash of the wrong theme on load.
- Establish the hexagon as the signature motif at the foundation level: brand mark/favicon and at least one integrated hex-geometry element in the shell (e.g. header mark or section marker), without a neural-canvas background.
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
- [ ] Light and dark mode both work, persist, and pass WCAG AA contrast (including any gold usage).
- [ ] The hexagon motif appears as an integrated design element, not a neural-canvas background.
- [ ] Orbitron is not used; the chosen humanist type is in place.
- [ ] Existing unrelated working-tree changes are preserved.
