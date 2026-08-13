#!/usr/bin/env python3
"""Build a searchable link index from the audited upstream Markdown lists."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

HEADING = re.compile(r"^(#{2,4})\s+(.+?)\s*$")
LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)[^)]*\)")
MARKUP = re.compile(r"[*_`#]|🌟|📝|👩‍💻|🖼️|📽️|🎶|🎯|📞|🎒")


def clean(value: str) -> str:
    return " ".join(MARKUP.sub("", value).split()).strip(" -")


def scan(path: Path) -> list[dict[str, str]]:
    headings: dict[int, str] = {}
    entries: list[dict[str, str]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        match = HEADING.match(line)
        if match:
            level = len(match.group(1))
            headings[level] = clean(match.group(2))
            for deeper in tuple(headings):
                if deeper > level:
                    del headings[deeper]
            continue
        if not line.lstrip().startswith(('-', '*')):
            continue
        category = " / ".join(headings[level] for level in sorted(headings))
        for name, url in LINK.findall(line):
            if "review" in name.lower() or name.lower() in {"source code", "announcement"}:
                continue
            entries.append({
                "name": clean(name),
                "category": category or "Uncategorized",
                "url": url.rstrip(".,"),
                "source": path.name,
            })
    return entries


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("inputs", nargs="+", type=Path)
    parser.add_argument("--revision", required=True)
    args = parser.parse_args()

    unique: dict[tuple[str, str], dict[str, str]] = {}
    for source in args.inputs:
        for entry in scan(source):
            unique.setdefault((entry["name"].casefold(), entry["url"].casefold()), entry)
    entries = sorted(unique.values(), key=lambda item: (item["category"], item["name"].casefold()))
    payload = {
        "source": "https://github.com/mahseema/awesome-ai-tools",
        "snapshot_commit": args.revision,
        "entries": entries,
    }
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {len(entries)} entries to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
