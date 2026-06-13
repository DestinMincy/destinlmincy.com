# UI Context

## Theme

The current brand is a dark technical agency interface: near-black backgrounds, electric blue, gold accents, angular geometry, neural/canvas atmosphere, and a high-contrast sci-fi feel. The Next.js app should preserve recognizable brand equity while making dashboards calmer and denser than the current marketing pages.

Hard rule: marketing can be expressive; dashboards must be usable. Do not carry heavy glow, clipped cards, or decorative canvas effects into admin/client work surfaces where they damage scanning and repeated use.

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

## Typography

| Role | Current Font | Use |
| --- | --- | --- |
| Display | Orbitron | Logo, marketing hero, major public-page headings |
| Body/UI | Rajdhani | Current public body copy |
| Dashboard UI | Undecided | Consider a more legible UI font for dense dashboard tables/forms; do not choose until implementation |

Do not use viewport-scaled font sizes inside dashboard controls. Marketing hero text can use responsive clamps where already appropriate.

## Shape And Surfaces

- Current marketing design uses angular/chamfered shapes with `clip-path`.
- Dashboard cards/panels should use restrained rectangular surfaces with subtle borders.
- Avoid nested cards.
- Cards are for repeated items, modals, or genuinely framed tools. Page sections should not become floating-card soup.

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
