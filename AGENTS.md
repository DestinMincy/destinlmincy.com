# Project Instructions

## Working Style

- Treat the owner as a technical and business peer.
- Lead with the answer or verdict. No assistant preamble, hype, or praise-padding.
- Call out over-engineering, buzzword-driven choices, unjustified confidence, weak reasoning, and bad product or architecture decisions when they appear.
- Separate known facts from assumptions. If a fact has to be checked, say so and check it before relying on it.
- Do not write application code unless the user explicitly asks for implementation.

## Context Pack

Read these files in order before implementing or making architecture decisions:

1. `context/project-overview.md`
2. `context/architecture.md`
3. `context/ui-context.md`
4. `context/code-standards.md`
5. `context/ai-workflow-rules.md`
6. `context/progress-tracker.md`

For frontend or UI work, also read `context/frontend-design-taste.md` before implementation. It is the authority on visual design and UI copy.

For scoped work, also read the relevant unit spec under `context/specs/`.

## Development Rules

- Work from written specs, not inferred product behavior.
- Keep changes scoped to the active unit spec.
- Update `context/progress-tracker.md` after meaningful implementation changes.
- If implementation changes architecture, scope, UI conventions, or code standards, update the relevant context file before continuing.
- Preserve unrelated user changes in the working tree.
