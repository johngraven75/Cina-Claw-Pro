#!/usr/bin/env python3
"""Build an index of Superpowers workflows without copying their instructions."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

NAME = re.compile(r"^name:\s*([^\r\n]+)\s*$", re.MULTILINE)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--revision", required=True)
    args = parser.parse_args()
    entries = []
    for path in sorted((args.root / "skills").glob("*/SKILL.md")):
        match = NAME.search(path.read_text(encoding="utf-8"))
        if not match:
            raise ValueError(f"missing name in {path}")
        entries.append({"name": match.group(1).strip(), "path": path.relative_to(args.root).as_posix()})
    payload = {
        "source": "https://github.com/obra/superpowers",
        "snapshot_commit": args.revision,
        "entries": entries,
    }
    args.output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(entries)} entries to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
