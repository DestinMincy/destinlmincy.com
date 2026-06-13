# Unit 14: Blog

## Goal

Add a public blog with repo-managed posts, SEO metadata, sitemap participation, and RSS.

## Design

Blog pages should be more readable than decorative. Keep brand alignment through typography, color, and header/footer, but prioritize article legibility.

## Implementation

### Content Model

- Choose Markdown or MDX before implementation.
- Store posts under `content/blog/`.
- Require frontmatter: title, description, date, slug, tags if used, and Open Graph fields.

### Routes

- Add `/blog`.
- Add `/blog/[slug]`.
- Add not-found behavior for invalid slugs.

### Feeds And Metadata

- Add RSS feed.
- Add sitemap integration.
- Add per-post metadata and Open Graph support.

## Dependencies

- Next.js foundation.
- Markdown/MDX parser selected during implementation.
- RSS generation package if not implemented through framework utilities.

## Verify When Done

- [ ] Blog index lists posts in reverse chronological order.
- [ ] Individual post pages render metadata and content.
- [ ] Invalid slug returns a proper not-found response.
- [ ] RSS feed includes published posts.
- [ ] Sitemap includes blog routes.
