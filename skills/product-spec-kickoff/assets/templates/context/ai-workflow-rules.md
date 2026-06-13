# AI Workflow Rules

## Approach

Build through small, spec-driven units. Do not implement from memory or vibes.

## Scoping Rules

- Work on one unit spec at a time.
- Do not combine unrelated UI, API, storage, integration, auth, and deployment work.
- Introduce dependencies just in time.
- If a requirement is unclear, update context or record an open question before coding.

## Handling Missing Requirements

- Do not invent product behavior absent from context/specs.
- Add unresolved decisions to `context/progress-tracker.md`.
- Add known defects/follow-ups to `context/current-issues.md`.

## Keeping Docs In Sync

Update the relevant context file when implementation changes:

- Product scope.
- Architecture.
- Storage model.
- Auth/access rules.
- UI conventions.
- Code standards.
- Progress or open questions.

## Before Moving To The Next Unit

1. The current unit works within scope.
2. Relevant checks pass.
3. Access control and data boundaries are verified where relevant.
4. `context/progress-tracker.md` is updated.
5. `context/current-issues.md` has no stale resolved issues.
