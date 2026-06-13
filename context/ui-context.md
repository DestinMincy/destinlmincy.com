# UI Context

## Committed Design Direction

The brand should feel **approachable, human, and trustworthy**. Destin runs this agency as a person, not a faceless firm, and the work involves clients' contracts and money, so warmth has to coexist with credibility.

This is an evolution of the existing blue/gold/silver brand, not a rebrand. The palette is a deliberate, long-standing choice and stays. What changes is the execution: the current dark, glowing, sci-fi signals (electric-blue glow, neural canvas atmosphere, Orbitron) read cold and faceless and fight the "approachable & human" goal.

- **Palette:** blue/gold/silver, recalibrated for warmth. Blue stays primary and structural but as a confident, slightly deeper blue, not an electric neon glow; blue carries trust. Gold is the warmth carrier and the signal/accent color (emphasis, key actions, highlights), used sparingly. Silver is structural metal (borders, dividers, secondary surfaces, muted text), not a third decorative color. Add warm neutrals (warm off-white surface, warm near-black ink) so nothing reads as cold grey.
- **Type:** retire Orbitron and Rajdhani. Use Zilla Slab for display/headings and Hanken Grotesk for body/UI. The pairing is intentionally grounded and human: slab display for sturdy local-builder credibility over a warm, legible humanist grotesque for long-form and operational UI.
- **Layout primitive:** the hexagon is the signature primitive (see below), supported by a clear grid and hairline rules with generous human spacing. One primitive, repeated, becomes the brand signature. Cards only for genuinely repeated items.
- **Hexagon motif (core, required):** the hex shape is a committed, central design element, not optional decoration. It appears as the brand mark (logo, favicon) and is integrated into page elements: hex-derived/chamfered geometry on key surfaces and image frames (e.g. Destin's headshot in a hex frame), hexagonal section markers and iconography frames, and a restrained hex tessellation as texture where it earns a place. It must NOT return as a glowing animated neural-network node canvas. The discipline: the hexagon is a deliberate, repeated signature, never applied to everything at once. Dense dashboard surfaces stay rectangular for scanning; there the hex appears only as markers, status, or iconography accents, not as panel shapes.
- **Show the human:** real photography of Destin and a first-person voice in copy. This is the single biggest "approachable & human" lever and costs no design tokens.

### Resolved decisions

1. **Light and dark mode, both from the start.** Ship both as first-class, intentional themes; neither is the reflexive default the blocklist warns about. Build on semantic, theme-resolved tokens from day one (see Theming below). Both themes must pass WCAG AA. Dark must be a warm dark, not the old cold blue-black.
2. **Hexagon stays as a core, integrated motif** (see Hexagon motif above), not just a logo. The cold neural-canvas execution is retired; the shape lives on as the signature primitive.

Hard rule: marketing can be expressive; dashboards must be usable. Do not carry heavy glow, clipped cards, or decorative canvas effects into admin/client work surfaces where they damage scanning and repeated use.

## Anti-Trope Rule

`context/frontend-design-taste.md` is the authority on frontend visual design and UI copy. Read it before building any UI. It defines the design-system derivation procedure and the full blocklist of AI "tells" (gradient blobs, purple/blue washes, glassmorphism, bento filler, Inter, banned copy vocabulary and sentence patterns, em dashes, and more). When it conflicts with framework or component-library defaults, it wins.

Short version for this file: avoid the default "AI-generated SaaS" look. Do not use decorative gradient blobs, purple/blue gradient washes, glassmorphism panels, generic bento grids, oversized rounded cards, meaningless glow effects, or stock "AI" visual metaphors unless there is a specific product reason documented in the active unit spec. Gradients are allowed only when they serve a concrete function: depth, state, brand accent, or readable image treatment. They are not a default background strategy. If a page starts to look like a vibe-coded template, stop and simplify toward typography, spacing, hierarchy, real content, and restrained surfaces.

For UI-heavy units, run the design-system derivation in `frontend-design-taste.md` (or an available design-direction/interface-review skill) before implementation, and state the chosen direction back before coding.

### Project reconciliation with the taste blocklist

`frontend-design-taste.md` is written as a general anti-default policy. A few of its "do NOT" items describe defaults this project has replaced with deliberate, documented choices. These are reconciliations, not exceptions to the trope bans:

- The blue/gold/silver palette is a deliberate, long-standing brand choice, not the banned purple-to-blue AI gradient wash. It reads heraldic, not lavender. Use blue and gold as flat brand colors, never as a decorative purple/blue gradient or glow.
- Lucide is the chosen icon set for dashboards, but the taste rule still holds: do not ship untouched default icons identically across every feature; vary and customize.
- The hexagon is a deliberate, committed brand geometry and the signature layout primitive, not the banned AI neural-network atmosphere. Integrate the shape (see Hexagon motif); never revive it as a glowing animated node canvas.
- On the remaining blocklist items: Orbitron is retired (it fights the human direction), and the project ships both light and dark as intentional first-class themes (not the reflexive dark-only the blocklist warns about). Verify WCAG AA contrast in both themes, especially body text and any gold usage.

Everything else in the blocklist (gradient blobs, glassmorphism, glow filler, bento default, colored left/top card stripes, copy vocabulary and sentence patterns, em/en dashes) applies in full.

## Colors

Existing source tokens from `src/styles/main.css`:

| Role | CSS Variable | Value |
| --- | --- | --- |
| Page background | `--color-bg` | `#0b1220` |
| Elevated background | `--color-bg-elev` | `#111a2b` |
| Panel background | `--color-bg-panel` | `#161c27` |
| Border | `--color-border` | `#1f2735` |
| Primary text | `--color-text` | `#e9f0ff` |
| Muted text | `--color-text-muted` | `#8a95a8` |
| Primary accent | `--color-accent` | `#2776EA` |
| Accent light | `--color-accent-light` | `#5BA3FF` |
| Gold accent | `--color-accent-2` | `#FFD700` |
| Silver accent | `--color-accent-3` | `#C0C0C0` |
| Error | `--color-danger` | `#ff5c7a` |
| Success | `--color-success` | `#4ade80` |

Migration rule: map these into the Next.js CSS token system before creating new colors. Add new neutral dashboard tokens only when repeated UI states require them.

Recalibration for the committed direction (see Committed Design Direction): these tokens are the source of record but are being warmed and re-roled. Deepen the primary blue away from the electric glow value; promote gold to the sparing warmth/signal accent; treat silver as a structural neutral (borders, dividers, muted text) rather than decoration; and add warm off-white surface and warm near-black ink neutrals so surfaces do not read as cold grey or blue-black. Do not introduce new hues outside blue/gold/silver plus neutrals.

### Theming (light and dark, both first-class)

Both modes ship from the start, so the token layer is semantic, not raw hex. Define role tokens (surface, surface-elevated, surface-panel, text, text-muted, border, accent, signal, success, danger) that resolve per theme; components reference roles only, never literal colors. Initialize from `prefers-color-scheme`, expose a real persisted toggle, and avoid a flash of the wrong theme on load.

Palette behavior across themes:
- **Blue** is the primary brand color in both modes; pick a value that holds contrast on a light surface and on a warm dark surface (it may resolve to a slightly different tint per theme).
- **Gold** is the warmth/signal accent. Gold has poor contrast as text on light surfaces, so use it as a fill with dark text on it, or as emphasis on darker surfaces; do not set small gold text on white. Verify every gold usage against AA.
- **Silver** is a structural neutral (borders, dividers, muted text), re-roled per theme; it is not a third decorative color.
- Dark mode is a **warm** dark, not the old cold blue-black (`#0b1220`).

## Typography

| Role | Font | Use |
| --- | --- | --- |
| Display/headings | Zilla Slab, weight 600 | Logo wordmark, marketing hero, major public-page headings, section headings, step numerals |
| Body/UI | Hanken Grotesk variable, weights 100-900 | Public body copy, dashboard UI, forms, tables, nav, buttons |
| Fallback display | Georgia, serif | Only if self-hosted Zilla Slab fails |
| Fallback body | system-ui, sans-serif | Only if self-hosted Hanken Grotesk fails |

Type bans (from `frontend-design-taste.md`): not Inter anywhere, not Orbitron, not Rajdhani for the new app, and not the recycled Space Grotesk / Geist / Instrument Serif combos.

Keep roles strict. Zilla Slab is for headings/display and selected numerals or markers only. Hanken Grotesk owns body, UI, controls, labels, and dashboard text. Do not mix them casually or the pairing loses its point.

### Font Hosting

Self-host fonts. Do not load Google Fonts or any external font service in production.

Use Fontsource packages during implementation:

- `@fontsource-variable/hanken-grotesk`
- `@fontsource/zilla-slab`

Copy the required WOFF2 files into the static font directory, likely `/public/fonts` in the Next.js app:

- `hanken-grotesk-latin-wght-normal.woff2`
- `zilla-slab-latin-600-normal.woff2`
- Optional for lighter numerals: `zilla-slab-latin-400-normal.woff2`

Required `@font-face` shape:

```css
@font-face {
  font-family: 'Hanken Grotesk';
  src: url('/fonts/hanken-grotesk-latin-wght-normal.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Zilla Slab';
  src: url('/fonts/zilla-slab-latin-600-normal.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
```

Token requirements:

```css
:root {
  --font-display: 'Zilla Slab', Georgia, serif;
  --font-body: 'Hanken Grotesk', system-ui, sans-serif;
}
```

Baseline type rules:

- `body`: `font-family: var(--font-body)`, `line-height: 1.6`, `font-weight: 400`.
- `h1`, `h2`, `h3`: `font-family: var(--font-display)`, `font-weight: 600`.
- `h1`: `font-size: clamp(2.6rem, 6.2vw, 4.7rem)`, `line-height: 1.08`, `letter-spacing: -0.02em`.
- `h2`: `font-size: clamp(1.9rem, 3.8vw, 2.85rem)`, `line-height: 1.1`.
- `h3`: `font-size: 1.4rem`, `line-height: 1.15`.
- `p`, `li`: `font-size: clamp(1.0625rem, 1.4vw, 1.125rem)`.
- Eyebrows: Hanken Grotesk, uppercase, `letter-spacing: 0.2em`, `font-size: 0.74rem`, `font-weight: 600`, gold token.
- Buttons: Hanken Grotesk, `font-weight: 600`.
- Step numbers and numbered markers: Zilla Slab, `font-weight: 600`, gold token.

Do not use viewport-scaled font sizes inside dashboard controls. Marketing hero text can use responsive clamps where already appropriate.

## Shape And Surfaces

- The hexagon is the signature geometry. Use hex/chamfered `clip-path` shapes deliberately on key marketing surfaces, image frames (Destin's headshot), section markers, and iconography frames. Repeat it enough to read as intentional; do not apply it to every element.
- Marketing may be expressive with the hex geometry; dashboards stay rectangular for scannability, with the hex appearing only as markers, status, or icon accents.
- Dashboard cards/panels should use restrained rectangular surfaces with subtle borders.
- Avoid nested cards.
- Cards are for repeated items, modals, or genuinely framed tools. Page sections should not become floating-card soup.
- Do not use gradients as a substitute for layout, hierarchy, or real content.
- Avoid large rounded rectangles and generic SaaS panels unless the component has a clear operational purpose. Per `frontend-design-taste.md`, do not round every corner uniformly; the hex/chamfer geometry is the deliberate alternative.

## Component Direction

- Use accessible React primitives and local components.
- shadcn/ui is acceptable for dashboard controls if it reduces hand-rolled accessibility work.
- Lucide React is the default icon set if an icon library is added.
- Buttons, tabs, menus, forms, tables, badges, and dialogs must have real states, not decorative placeholders.

## Layout Patterns

- Public pages: full-width sections with constrained inner content, preserving current brand atmosphere.
- Blog: readable article layout, strong metadata, no dashboard chrome.
- Client dashboard: top-level app shell with account/billing context visible and compact navigation.
- Admin dashboard: denser operational layout with tables/lists, filters where needed, and clear empty states.
- Auth pages: use Clerk-hosted or Clerk components unless custom UI is explicitly justified.

## Responsive Requirements

- Public pages must work on mobile, tablet, and desktop.
- Dashboards must remain usable on mobile, but desktop density matters because admin work is likely desktop-first.
- Navigation must not hide critical billing/account/admin controls behind unclear icons.
