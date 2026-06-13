# Unit 01: Next.js Foundation

## Goal

Create the Next.js React TypeScript application foundation without implementing auth, database-backed features, billing, contracts, or dashboards. Stage the Next app alongside the existing Eleventy site until the Next public shell is verified. Preserve the current public brand direction and enough public routes to prove the app shell works.

## Design

Follow the committed design direction in `context/ui-context.md`: an approachable, human, trustworthy evolution of the blue/gold/silver brand. Keep the palette, recalibrated for warmth; retire Orbitron and Rajdhani; use Zilla Slab for display/headings and Hanken Grotesk for body/UI; make the hexagon the signature integrated motif rather than a neural-canvas background. Ship light and dark mode as first-class themes from the start, built on semantic theme-resolved tokens. Build the layout in Next.js-native components rather than copying raw Nunjucks. Do not carry the cold sci-fi glow/canvas execution forward.

`context/frontend-design-taste.md` is the authority on visual design and UI copy for this work. Avoid AI-template visual tropes during the migration: no decorative gradient blobs, generic purple/blue gradient washes, glassmorphism panels, glow-heavy filler, or bento-card decoration. Carry brand recognition through the recalibrated tokens, the hex mark, typography, spacing, and real content rather than atmosphere. Gradients require a specific functional or brand reason.

## Implementation

### App Foundation

- Add Next.js App Router with TypeScript strict mode.
- Stage the Next.js app in this branch without deleting the current Eleventy `src/` site. This branch is the launch path: once the overhaul branch merges to `master`, the Next.js app is intended to be the production site.
- Add root layout, metadata defaults, public header, and footer.
- Add global CSS/token setup using semantic, theme-resolved tokens (surface, text, border, accent, signal, etc.), derived from the canonical brand colors in `context/ui-context.md`: Blue `#2675e9`, Gold `#ffd700`, Silver `#c0c0c0`.
- Add self-hosted font setup from Fontsource-sourced WOFF2 files in the static font directory. Do not use Google Fonts or external font requests in production.
- Add `--font-display` and `--font-body` tokens using Zilla Slab and Hanken Grotesk exactly as specified in `context/ui-context.md`.
- Add light and dark mode as first-class themes from the start: initialize from `prefers-color-scheme`, expose a persisted toggle, and prevent a flash of the wrong theme on load.
- Establish the hexagon as the signature motif at the foundation level: brand mark/favicon and at least one integrated hex-geometry element in the shell (e.g. header mark or section marker), without a neural-canvas background.
- Add clear npm scripts for Next.js dev, build, start, lint/typecheck if selected. During this staged phase, avoid breaking the ability to run or inspect the legacy Eleventy site until the Next shell is verified.
- Migrate enough public routes to prove navigation: `/`, `/about`, `/services`, `/work`, `/contact`.

### Asset Handling

- Move reusable public assets into `public/` or an equivalent Next-safe location.
- Preserve current logo, favicon, Open Graph image, and key brand images.

### Legacy Handling

- Do not delete Eleventy files in this unit.
- Keep legacy content and assets available for migration.
- Make Next.js and legacy Eleventy development/build commands unambiguous during the staged overlap.
- Switch primary production scripts to Next.js only after the Next foundation builds and the migrated public shell is verified.
- Leave full Eleventy cleanup to Unit 16.

## Dependencies

- `next`
- `react`
- `react-dom`
- `typescript`
- `@fontsource-variable/hanken-grotesk`
- `@fontsource/zilla-slab`
- Styling dependencies only if selected during implementation.

## Verify When Done

- [ ] `npm run dev` starts the Next.js app.
- [ ] `npm run build` passes.
- [ ] Legacy Eleventy source remains available and has not been deleted.
- [ ] Next.js and legacy Eleventy scripts are unambiguous during the staged overlap.
- [ ] Public navigation works for migrated routes.
- [ ] Metadata exists for the home page.
- [ ] Public shell avoids generic AI/SaaS visual tropes and does not rely on decorative gradients.
- [ ] Light and dark mode both work, persist, and pass WCAG AA contrast (including any gold usage).
- [ ] The hexagon motif appears as an integrated design element, not a neural-canvas background.
- [ ] Orbitron and Rajdhani are not used in the new app.
- [ ] Zilla Slab and Hanken Grotesk are self-hosted with no production Google Fonts or external font requests.
- [ ] Font roles are strict: Zilla Slab for display/headings/markers, Hanken Grotesk for body/UI.
- [ ] Existing unrelated working-tree changes are preserved.
