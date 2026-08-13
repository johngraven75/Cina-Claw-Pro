#!/usr/bin/env python3
"""Search a bundled upstream skill-path catalog."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def words(value: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", value.lower())


def score(entry: dict[str, str], query: str) -> int:
    query_words = words(query)
    if not query_words:
        return 0
    name = entry.get("name", "").lower()
    plugin = entry.get("plugin", "").lower()
    path = entry.get("path", "").lower()
    haystack = " ".join((name, plugin, path))
    total = 0
    for term in query_words:
        if term == name:
            total += 20
        elif term in name:
            total += 10
        elif term in plugin:
            total += 5
        elif term in haystack:
            total += 2
    if query.lower() in haystack:
        total += 8
    return total


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("catalog", type=Path)
    parser.add_argument("query")
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    payload = json.loads(args.catalog.read_text(encoding="utf-8"))
    entries = payload["entries"] if isinstance(payload, dict) else payload
    ranked = [(score(entry, args.query), entry) for entry in entries]
    ranked = [(points, entry) for points, entry in ranked if points > 0]
    ranked.sort(key=lambda item: (-item[0], item[1].get("name", ""), item[1].get("path", "")))

    for points, entry in ranked[: max(1, args.limit)]:
        plugin = entry.get("plugin")
        label = f"{plugin}:{entry['name']}" if plugin else entry["name"]
        print(f"{points:>3}  {label}\n     {entry['path']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
