---
name: product-spec-kickoff
description: Product planning workflow for starting a new project, expanding a product idea, or turning a vague concept into a concrete implementation spec. Use when the user says they are starting a new project, want to expand a product idea, want to brainstorm a product, want to create a six-file context system, want unit specs, or wants a blank issues file before coding.
---

# Product Spec Kickoff

## Rule

Do not code product features during this workflow. The output is written context, specs, and an issue-tracking starting point.

Use this workflow to convert an idea into:

- `AGENTS.md` or the repo's existing agent entrypoint.
- `context/project-overview.md`
- `context/architecture.md`
- `context/ui-context.md`
- `context/code-standards.md`
- `context/ai-workflow-rules.md`
- `context/progress-tracker.md`
- `context/current-issues.md`
- `context/specs/00-build-plan.md`
- Small unit specs under `context/specs/`.

## Workflow

### 1. Establish Workspace

- Confirm the target repo/path if ambiguous.
- If the repo is git-backed, check branch and status before writing.
- If the user wants a new branch, create it before writing files.
- Preserve unrelated user changes.

### 2. Inspect Existing Context

Read available project files before asking product questions:

- Existing `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or equivalent.
- Existing docs, README, roadmap, package files, deployment docs.
- Existing source tree, routes, schemas, config, and tests.
- Existing `context/` files if present.

Do not overwrite existing context files blindly. If they exist, refine them.

### 3. Brainstorm Product Spine

Ask concise questions until the product spine is clear. Prefer one decision at a time.

Required decisions:

- Primary business object.
- Primary users and user roles.
- V1 core workflow.
- Admin/operator workflow.
- Data model boundaries.
- External integrations.
- Billing/payment model if relevant.
- Auth/access model if relevant.
- Deployment/storage assumptions.
- V1 versus deferred scope.

Push back on vague or inflated scope. Call out fake precision, over-engineering, and product-model mismatches.

### 4. Propose The Design

Before writing specs, present the proposed product design:

- Recommended approach.
- Alternatives rejected and why.
- Domain model.
- Core flows.
- V1 feature set.
- Deferred features.
- Major risks/open questions.

Get user approval before writing final context/spec files.

### 5. Bootstrap Or Update Files

Use the bundled script for a new context pack:

```powershell
python path\to\product-spec-kickoff\scripts\bootstrap_product_spec_context.py --target "D:\path\to\repo" --entry AGENTS.md
```

The script copies template files and refuses to overwrite unless `--force` is passed.

After bootstrapping, replace placeholders with concrete product decisions. Do not leave generic text in a working repo.

### 6. Write Unit Specs

Create small, verifiable units. Each unit should:

- Produce one visible, testable, or queryable result.
- Stay mostly within one system boundary.
- Introduce dependencies just in time.
- Have a concrete verification checklist.
- Avoid bundling unrelated UI, API, storage, and deployment work together.

Ordering rules:

- Foundation before features.
- Data contracts before UI wiring when data matters.
- Auth/access before protected features.
- External integrations after local domain model.
- Client/admin assembly after underlying domain units exist.
- Deployment after the production build path exists.
- Legacy cleanup last.

### 7. Create Blank Issue File

Create `context/current-issues.md` even when there are no issues.

Keep it blank except for the title and short usage note. During implementation, remove only verified-resolved issues. Never clear unresolved issues just to make the file look clean.

### 8. Self-Review

Before finishing:

- Scan for placeholders: `TODO`, `TBD`, `[placeholder]`, generic examples.
- Scan for contradictions between overview, architecture, and specs.
- Confirm every V1 feature appears in a unit spec.
- Confirm every deferred feature is explicitly out of scope.
- Confirm open questions are captured in `progress-tracker.md`.
- If git-backed, commit only the context/spec files when the user wants a committed planning baseline.

## Script And Template Contents

- `scripts/bootstrap_product_spec_context.py` creates the starter context tree.
- `assets/templates/` contains portable templates for context files, build plan, first unit spec, and blank issues file.

Use the script for a fresh repo. For an existing repo, read and patch the existing files instead.
