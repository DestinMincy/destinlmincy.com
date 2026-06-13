# Frontend Design Taste

## Precedence
This skill is the authority on frontend visual design and UI copy. When its rules conflict with any other design skill, built-in design guidance, framework defaults, or component-library defaults, this file wins. Do not average between this and another source; follow this one and ignore the conflicting rule.

## Purpose
Make generated web UI look deliberately designed, not default-LLM-generated. Two parts: (1) a per-project procedure for committing to an intentional design system, and (2) a blocklist of AI "tells" to never emit. The blocklist is a floor (gets you to neutral). The design system is the goal (gets you to good). When a brief is vague, run the procedure. Never fall back to model defaults.

## The "modern" trap (read first)
"Make it modern / clean / sleek / minimal" is NOT a design decision. The current default LLM aesthetic (dark mode, purple-to-blue, Inter, glassmorphism, soft shadows on everything) is exactly what reads as "modern," which is why it has become invisible slop. Treat vague adjectives as a brief to be translated into concrete committed choices, not as an instruction to pass through. If the user says "modern," you still must run the derivation procedure and pick specifics.

## Design system derivation (run before building any UI)
1. IDENTIFY the project: domain, audience, and the 3 adjectives describing how it should FEEL. Derive these from the codebase, prompt, and product context. Do not invent a personality that does not fit.
2. PALETTE: choose colors that fit that feeling, explicitly NOT lavender/purple-to-blue defaults. Give it a point of view (warm earth tones, high-contrast neutral + one bright accent, monochrome + signal color, etc.). Match domain: fintech reads different from a kids app from a dev tool.
3. TYPE SYSTEM: pick a headline font and a DISTINCT body font. Inter is banned for both. If a serif/sans contrast fits the feeling, use it intentionally, not as decoration.
4. LAYOUT PRIMITIVE: pick ONE strong primitive and repeat it until it becomes the signature. Do not mix multiple card styles and section archetypes on one page.
5. STATE the chosen design system back to the user in one short block (palette, type, primitive, the 3 adjectives) BEFORE generating the UI. This makes it a reviewable decision, not an accident.

## Layout / structure: do NOT
- Put a colored stripe (3 to 4px) on the left or top edge of cards. Single most reliable visual AI tell.
- Use a centered hero with a sans headline and a pill/badge floating directly above the H1 ("Now in beta", "Backed by...").
- Build identical feature cards in a 3-column grid with an icon stacked on top of each.
- Default to a bento grid (mixed-size tile 2x2) layout.
- Add numbered "1, 2, 3" step sequences or stat-banner rows (big number + tiny label, repeated across).
- Put emoji in the nav or sidebar as icons.
- Assemble the stock skeleton in stock order: hero, "Trusted by" logo bar, 3-col features, how-it-works, stats, testimonial carousel, pricing table, FAQ accordion, CTA band, fat footer. Vary it or cut sections that earn nothing.

## Typography: do NOT
- Use Inter for anything, especially the hero headline. Use the chosen TYPE SYSTEM.
- Reach for the recycled combos: Space Grotesk, Geist, Instrument Serif.
- Drop a single serif-italic accent word into an otherwise sans headline.
- Set ALL-CAPS wide-tracked eyebrow labels above every section.

## Color: do NOT
- Use lavender/"VibeCode purple," or purple-to-blue gradients on buttons, text, backgrounds, or orbs.
- Ship permanent dark mode as the only mode.
- Use medium-grey body text on dark backgrounds. Functional bug: fails WCAG AA contrast. Always verify contrast ratio.
- Add large colored glows, colored box-shadows, or blurred background orbs.

## Surface / texture: do NOT
- Use glassmorphism (frosted-glass translucent cards).
- Ship unmodified shadcn/ui defaults. If shadcn is used, customize border radius, shadow depth, and color tokens.
- Round every corner, soft-shadow every element, and apply uniform generous padding so nothing has an edge.

## Imagery: do NOT
- Use Corporate Memphis / "Alegria" flat blobby illustrated people.
- Drop in generic 3D render blobs (Spline-style spheres, abstract gradient shapes) as meaningless hero filler.
- Use AI-generated stock images with artifacts (mangled background text, malformed hands, melted logos, generic "diverse team in bright office").
- Use untouched default icon sets (Lucide/Heroicons) identically across every feature.

## Motion: do NOT
- Fade-up-and-in every section on scroll.
- Add floating/bouncing badges or gradient-shimmer text. No motion without a reason.

## Copy: banned vocabulary
Avoid in any tense/form: seamless, robust, cutting-edge, elevate, unlock, unleash, supercharge, harness, leverage, revolutionize, empower, streamline, transform, effortless, delve, navigate, realm, tailored, foster, crafted, captivate, game-changer, skyrocket.

## Copy: banned openers
"In today's fast-paced world", "In the era of", "In a world where".

## Copy: banned sentence patterns
- "It's not just X, it's Y" / "That's not X, that's Y"
- "No X. No Y. Just Z."
- The three-word staccato triad ("Focused. Aligned. Measurable.")
- "And the result? Y." / "The outcome? Y."
- Rule-of-three structures used reflexively.
- Title Case On Everything.

## Punctuation
- No em dashes or en dashes. Replace with colons, commas, parentheses, pipes, or periods.

## Meta-rule
Zero blocklist hits = neutral, not good. Distinctiveness comes only from the derived design system: a palette with a point of view, a non-default type pairing, and one repeated layout primitive. Enforce the blocklist as the floor; build quality from the design system as the goal.