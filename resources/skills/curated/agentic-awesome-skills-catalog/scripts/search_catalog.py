#!/usr/bin/env python3
"""Search the bundled Agentic Awesome Skills name catalog."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def terms(value: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", value.lower())


def rank(name: str, query: str) -> int:
    lowered = name.lower()
    score = sum(10 if term in lowered else 0 for term in terms(query))
    if query.lower() in lowered:
        score += 8
    return score


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("catalog", type=Path)
    parser.add_argument("query")
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    payload = json.loads(args.catalog.read_text(encoding="utf-8"))
    matches = sorted(
        ((rank(name, args.query), name) for name in payload["entries"]),
        key=lambda item: (-item[0], item[1]),
    )
    template = payload["path_template"]
    for score, name in [item for item in matches if item[0] > 0][: max(1, args.limit)]:
        print(f"{score:>3}  {name}\n     {template.format(name=name)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
