#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import re
from typing import Iterable, Tuple

INLINE_DISPLAY_MATH_RE = re.compile(
    r'^(?P<indent>[ \t]*)\$\$(?P<content>[^\n]*?)\$\$(?P<ws>[ \t]*)$',
    re.MULTILINE,
)


def format_display_math(text: str) -> Tuple[str, int]:
    """Convert single-line $$...$$ display math blocks to multi-line form."""

    def replacement(match: re.Match[str]) -> str:
        indent = match.group("indent")
        content = match.group("content").strip()
        return f"{indent}$$\n{indent}{content}\n{indent}$$"

    new_text, count = INLINE_DISPLAY_MATH_RE.subn(replacement, text)
    return new_text, count


def iter_markdown_files(paths: Iterable[str]) -> Iterable[Path]:
    for path_str in paths:
        path = Path(path_str)
        if path.is_dir():
            yield from sorted(path.rglob("*.mdx"))
            yield from sorted(path.rglob("*.md"))
        elif path.is_file() and path.suffix.lower() in {".md", ".mdx"}:
            yield path
        else:
            raise FileNotFoundError(f"Path not found or unsupported: {path}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert single-line $$...$$ display math into block form in .md and .mdx files."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        default=["."],
        help="Files or directories to scan. Defaults to current directory.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would change without writing files.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print each file that is updated.",
    )

    args = parser.parse_args()

    total_files = 0
    total_replacements = 0

    for file_path in iter_markdown_files(args.paths):
        text = file_path.read_text(encoding="utf-8")
        updated_text, count = format_display_math(text)
        if count <= 0:
            continue

        total_files += 1
        total_replacements += count

        if args.dry_run:
            print(f"[dry-run] {file_path}: {count} replacement(s)")
        else:
            file_path.write_text(updated_text, encoding="utf-8")
            if args.verbose:
                print(f"Updated {file_path}: {count} replacement(s)")

    print(
        f"Processed {total_files} file(s), applied {total_replacements} display-math replacement(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
