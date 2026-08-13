#!/usr/bin/env python3
"""Search the bundled ECC skill-name index without third-party dependencies."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


CATALOG = Path(__file__).resolve().parents[1] / "references" / "catalog.json"
BASE_URL = "https://github.com/affaan-m/ECC/blob/main"


def tokens(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", value.lower().replace("_", " ").replace("-", " ")))


def load_names(path: Path = CATALOG) -> list[str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list) or not all(isinstance(item, str) for item in data):
        raise ValueError("catalog.json must contain a list of strings")
    return data


def search(names: list[str], query: str, limit: int) -> list[dict[str, object]]:
    terms = tokens(query)
    ranked: list[tuple[int, str]] = []
    for name in names:
        name_terms = tokens(name)
        score = 5 * len(terms & name_terms)
        if query.lower().strip() in name.lower():
            score += 4
        if not terms or score:
            ranked.append((score, name))
    ranked.sort(key=lambda item: (-item[0], item[1]))
    return [
        {
            "name": name,
            "path": f"skills/{name}/SKILL.md",
            "source_url": f"{BASE_URL}/skills/{name}/SKILL.md",
            "score": score,
        }
        for score, name in ranked[:limit]
    ]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Search all ECC skill identifiers")
    parser.add_argument("query", nargs="?", default="")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--list", action="store_true")
    args = parser.parse_args(argv)
    if args.limit < 1:
        raise SystemExit("--limit must be at least 1")
    names = load_names()
    if args.list:
        print("\n".join(names))
        return 0
    print(json.dumps(search(names, args.query, args.limit), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
