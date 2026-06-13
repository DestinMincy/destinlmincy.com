#!/usr/bin/env python3
"""Bootstrap a product spec context pack into a repository."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "assets" / "templates"


def copy_file(src: Path, dest: Path, force: bool) -> str:
    if dest.exists() and not force:
        return f"skip exists {dest}"
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    return f"write {dest}"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create a six-file product context pack with specs and blank issues file."
    )
    parser.add_argument("--target", required=True, help="Target repo/project directory")
    parser.add_argument("--entry", default="AGENTS.md", help="Agent entrypoint filename")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    target = Path(args.target).resolve()
    if not target.exists():
        raise SystemExit(f"target does not exist: {target}")
    if not target.is_dir():
        raise SystemExit(f"target is not a directory: {target}")

    files = {
        "AGENTS.md": args.entry,
        "context/project-overview.md": "context/project-overview.md",
        "context/architecture.md": "context/architecture.md",
        "context/ui-context.md": "context/ui-context.md",
        "context/code-standards.md": "context/code-standards.md",
        "context/ai-workflow-rules.md": "context/ai-workflow-rules.md",
        "context/progress-tracker.md": "context/progress-tracker.md",
        "context/current-issues.md": "context/current-issues.md",
        "context/specs/00-build-plan.md": "context/specs/00-build-plan.md",
        "context/specs/01-foundation.md": "context/specs/01-foundation.md",
    }

    for src_rel, dest_rel in files.items():
        print(copy_file(TEMPLATES / src_rel, target / dest_rel, args.force))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
