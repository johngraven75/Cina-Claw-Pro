#!/usr/bin/env python3
"""Search a bundled upstream skill-path catalog."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def words(value: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", value.lower())


def score(entry: dict[str, object], query: str) -> int:
    query_words = words(query)
    name = str(entry.get("name", "")).lower()
    fields = " ".join(str(value) for value in entry.values()).lower()
    total = 0
    for term in query_words:
        if term == name:
            total += 20
        elif term in name:
            total += 10
        elif term in fields:
            total += 3
    if query.lower() in fields:
        total += 8
    return total


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("catalog", type=Path)
    parser.add_argument("query", nargs="?", default="")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--list", action="store_true")
    args = parser.parse_args()

    payload = json.loads(args.catalog.read_text(encoding="utf-8"))
    entries = payload["entries"]
    if args.list:
        for entry in entries:
            print(f"{entry['name']}\t{entry['path']}")
        return 0

    ranked = [(score(entry, args.query), entry) for entry in entries]
    ranked = [(points, entry) for points, entry in ranked if points > 0]
    ranked.sort(key=lambda item: (-item[0], str(item[1]["name"]), str(item[1]["path"])))
    for points, entry in ranked[: max(1, args.limit)]:
        labels = [
            str(entry[key])
            for key in ("category", "group")
            if entry.get(key)
        ]
        suffix = f" [{', '.join(labels)}]" if labels else ""
        print(f"{points:>3}  {entry['name']}{suffix}\n     {entry['path']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
