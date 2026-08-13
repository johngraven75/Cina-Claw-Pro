#!/usr/bin/env python3
"""Search a reviewed agent-skill catalog."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def terms(value: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", value.lower())


def rank(entry: dict[str, object], query: str) -> int:
    haystack = " ".join(str(entry.get(key, "")) for key in ("name", "category", "path", "url")).lower()
    score = sum(10 if term in haystack else 0 for term in terms(query))
    if query.lower() in haystack:
        score += 8
    return score


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("catalog", type=Path)
    parser.add_argument("query")
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()
    query = args.query.strip()
    if not query:
        parser.error("query must not be empty")

    payload = json.loads(args.catalog.read_text(encoding="utf-8"))
    matches = sorted(
        ((rank(entry, query), entry) for entry in payload["entries"]),
        key=lambda item: (-item[0], str(item[1].get("name", ""))),
    )
    for score, entry in [item for item in matches if item[0] > 0][: max(1, args.limit)]:
        print(f"{score:>3}  {entry['name']} [{entry.get('category', 'Uncategorized')}]\n     {entry['url']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
