#!/usr/bin/env python3
"""Query the premium-microsite knowledge base in data/*.csv.

Usage:
    python3 scripts/microsite_search.py "<query>" [--domain <domain>] [--max-results N] [--format md|box|json]
    python3 scripts/microsite_search.py --list-domains
    python3 scripts/microsite_search.py "<query>" --domain archetype --field Archetype

Domains: archetype, section, motion, webgl, schema, stack, brand, budget, content
With no --domain the query is scored across every domain and the best rows win.

Ranking is BM25 over the concatenated row text with an extra weight on the
Keywords and name columns. Standard library only: no install step, works the
same for Codex and Claude Code.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sys
from collections import Counter
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

DOMAINS = {
    "archetype": ("microsite-archetypes.csv", "Archetype", "Site archetypes: sections, motion tier, schema, proof, exclusions"),
    "section": ("section-recipes.csv", "Section", "Section recipes: slots, layout, motion, states, a11y, copy rule"),
    "motion": ("motion-recipes.csv", "Recipe", "Motion recipes: GSAP/Lenis snippets, reduced-motion end state, cleanup"),
    "webgl": ("webgl-recipes.csv", "Pattern", "WebGL patterns: asset spec, fallback, budget, checks"),
    "schema": ("schema-recipes.csv", "Schema", "JSON-LD templates, validation and pitfalls per entity"),
    "stack": ("stack-recipes.csv", "Recipe", "Stack recipes: scaffold commands, prerender approach, gotchas"),
    "brand": ("brand-kits.csv", "Kit", "Brand kits: palette, type pairing, scale, motion tier, texture"),
    "budget": ("perf-budgets.csv", "Tier", "Performance budget tiers and measurement profiles"),
    "content": ("content-formulas.csv", "Slot", "Copy formulas, length, examples and truth constraints"),
}

# Columns that carry naming/keyword signal and are worth extra weight.
BOOST_COLUMNS = {"Keywords", "Archetype", "Section", "Recipe", "Pattern", "Schema", "Kit", "Tier", "Slot"}
BOOST_FACTOR = 3

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "i",
    "in", "is", "it", "its", "of", "on", "or", "that", "the", "to", "want",
    "was", "what", "when", "with", "you", "your", "make", "build", "create",
    "site", "website", "page",
}

TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9+#.-]*")


def tokenize(text: str) -> list[str]:
    return [t for t in TOKEN_RE.findall(text.lower()) if t not in STOPWORDS and len(t) > 1]


def load_domain(domain: str) -> tuple[list[dict], str]:
    filename, name_col, _ = DOMAINS[domain]
    path = DATA_DIR / filename
    if not path.exists():
        raise SystemExit(f"Missing data file: {path}")
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    return rows, name_col


def build_index(rows: list[dict]) -> list[list[str]]:
    docs = []
    for row in rows:
        tokens: list[str] = []
        for column, value in row.items():
            if not value:
                continue
            chunk = tokenize(value)
            tokens.extend(chunk * BOOST_FACTOR if column in BOOST_COLUMNS else chunk)
        docs.append(tokens)
    return docs


def bm25(query: list[str], docs: list[list[str]], k1: float = 1.5, b: float = 0.75) -> list[float]:
    n = len(docs)
    if n == 0:
        return []
    lengths = [len(d) for d in docs]
    avgdl = sum(lengths) / n or 1.0
    freqs = [Counter(d) for d in docs]
    df = Counter()
    for f in freqs:
        for term in f:
            df[term] += 1

    scores = [0.0] * n
    for term in query:
        if term not in df:
            continue
        idf = math.log(1 + (n - df[term] + 0.5) / (df[term] + 0.5))
        for i, f in enumerate(freqs):
            tf = f.get(term, 0)
            if not tf:
                continue
            denom = tf + k1 * (1 - b + b * lengths[i] / avgdl)
            scores[i] += idf * (tf * (k1 + 1)) / denom
    return scores


def search_domain(domain: str, query: str, limit: int) -> list[tuple[float, dict]]:
    rows, _ = load_domain(domain)
    terms = tokenize(query)
    if not terms:
        return [(0.0, row) for row in rows[:limit]]
    scores = bm25(terms, build_index(rows))
    ranked = sorted(zip(scores, range(len(rows))), key=lambda pair: (-pair[0], pair[1]))
    return [(score, rows[i]) for score, i in ranked[:limit] if score > 0]


def exact_lookup(domain: str, value: str) -> dict | None:
    rows, name_col = load_domain(domain)
    for row in rows:
        if row.get(name_col, "").strip().lower() == value.strip().lower():
            return row
    return None


def render_md(domain: str, query: str, hits: list[tuple[float, dict]], fields: list[str] | None) -> str:
    filename, name_col, _ = DOMAINS[domain]
    out = [f"## {domain} — {len(hits)} result(s) for {query!r}", f"Source: data/{filename}", ""]
    for score, row in hits:
        out.append(f"### {row.get(name_col, '(unnamed)')}  ·  score {score:.2f}")
        for column, value in row.items():
            if column == "No" or not value:
                continue
            if fields and column not in fields:
                continue
            out.append(f"- **{column}:** {value}")
        out.append("")
    return "\n".join(out)


def render_box(domain: str, query: str, hits: list[tuple[float, dict]], fields: list[str] | None) -> str:
    filename, name_col, _ = DOMAINS[domain]
    width = 78
    out = ["+" + "-" * width + "+", f"| {domain.upper()} :: {query[:width - len(domain) - 8]}".ljust(width + 1) + "|",
           "| " + f"data/{filename}".ljust(width - 1) + "|", "+" + "-" * width + "+"]
    for score, row in hits:
        out.append("| " + f"{row.get(name_col, '(unnamed)')}  [{score:.2f}]".ljust(width - 1) + "|")
        for column, value in row.items():
            if column == "No" or not value:
                continue
            if fields and column not in fields:
                continue
            text = f"{column}: {value}"
            while text:
                out.append("|   " + text[:width - 3].ljust(width - 3) + "|")
                text = text[width - 3:]
        out.append("+" + "-" * width + "+")
    return "\n".join(out)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("query", nargs="?", default="", help="free-text query")
    parser.add_argument("--domain", "-d", choices=sorted(DOMAINS), help="restrict to one domain")
    parser.add_argument("--max-results", "-n", type=int, default=3)
    parser.add_argument("--field", "-f", action="append", help="only print these columns (repeatable)")
    parser.add_argument("--format", choices=["md", "box", "json"], default="md")
    parser.add_argument("--exact", help="exact name lookup within --domain")
    parser.add_argument("--list-domains", action="store_true")
    args = parser.parse_args(argv)

    if args.list_domains:
        for name, (filename, _, description) in sorted(DOMAINS.items()):
            print(f"{name:<10} {filename:<26} {description}")
        return 0

    if args.exact:
        if not args.domain:
            parser.error("--exact requires --domain")
        row = exact_lookup(args.domain, args.exact)
        if row is None:
            print(f"No row named {args.exact!r} in domain {args.domain}", file=sys.stderr)
            return 1
        if args.format == "json":
            print(json.dumps(row, indent=2))
        else:
            print(render_md(args.domain, args.exact, [(0.0, row)], args.field))
        return 0

    if not args.query:
        parser.error("provide a query, --exact, or --list-domains")

    domains = [args.domain] if args.domain else sorted(DOMAINS)
    results: list[tuple[str, list[tuple[float, dict]]]] = []
    for domain in domains:
        hits = search_domain(domain, args.query, args.max_results)
        if hits:
            results.append((domain, hits))

    if not results:
        print(f"No matches for {args.query!r}. Try --list-domains or broader terms.", file=sys.stderr)
        return 1

    if not args.domain:
        # Cross-domain mode: keep the strongest domains first and trim the tail.
        results.sort(key=lambda pair: -pair[1][0][0])
        results = results[:3]

    if args.format == "json":
        payload = {d: [{"score": round(s, 3), **row} for s, row in hits] for d, hits in results}
        print(json.dumps(payload, indent=2))
        return 0

    renderer = render_box if args.format == "box" else render_md
    print("\n".join(renderer(d, args.query, hits, args.field) for d, hits in results))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
