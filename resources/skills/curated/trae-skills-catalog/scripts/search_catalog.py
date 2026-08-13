#!/usr/bin/env python3
"""Search the bundled TRAE Skills metadata without third-party dependencies."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "references" / "catalog"
METADATA = CATALOG / "metadata.json"


def tokens(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", value.lower().replace("_", " ")))


def load_entries(path: Path = METADATA) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("metadata.json must contain a list")
    return data


def search(entries: list[dict], query: str, category: str | None, limit: int) -> list[dict]:
    terms = tokens(query)
    ranked: list[tuple[int, str, dict]] = []
    for entry in entries:
        if category and entry.get("category") != category:
            continue
        name_tokens = tokens(str(entry.get("name", "")))
        tag_tokens = tokens(" ".join(map(str, entry.get("tags", []))))
        id_tokens = tokens(str(entry.get("id", "")))
        score = 5 * len(terms & name_tokens) + 3 * len(terms & tag_tokens) + len(terms & id_tokens)
        if not terms or score:
            item = dict(entry)
            item["path"] = f"{entry['category']}/{entry['id']}.md"
            item["source_url"] = (
                "https://github.com/HighMark-31/TRAE-Skills/blob/main/" + item["path"]
            )
            item["score"] = score
            ranked.append((score, str(entry.get("name", "")), item))
    ranked.sort(key=lambda value: (-value[0], value[1].lower()))
    return [item for _, _, item in ranked[:limit]]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Search bundled TRAE engineering recipes")
    parser.add_argument("query", nargs="?", default="")
    parser.add_argument("--category")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--list-categories", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.limit < 1:
        raise SystemExit("--limit must be at least 1")
    entries = load_entries()
    categories = sorted({str(entry.get("category", "")) for entry in entries})
    if args.list_categories:
        print("\n".join(categories))
        return 0
    if args.category and args.category not in categories:
        raise SystemExit(f"unknown category: {args.category}")
    print(json.dumps(search(entries, args.query, args.category, args.limit), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
