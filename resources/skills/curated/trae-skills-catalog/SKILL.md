---
name: trae-skills-catalog
description: Search and apply the imported HighMark-31/TRAE-Skills software-engineering recipe catalog across AI engineering, architecture, backend, frontend, mobile, DevOps, security, testing, documentation, and code management. Use when the user explicitly asks for TRAE Skills or when a coding task benefits from selecting a focused implementation recipe from this catalog.
---

# TRAE Skills Catalog

Use the upstream catalog as a searchable reference library, not as 233 simultaneously active instructions. The repository stores topic documents rather than native Claude Code or Codex skill packages, so this wrapper provides deliberate routing.

## Select recipes

Start with the bundled search utility:

```bash
python3 scripts/search_catalog.py "<task keywords>" --limit 5
```

Use `--category` to narrow results or `--list-categories` to inspect coverage. The result includes the exact upstream path and URL. Use the connected GitHub capability to read the best one to three matching files from `HighMark-31/TRAE-Skills` completely before acting. Prefer the smallest set that covers the request.

## Apply recipes safely

1. Inspect the actual repository, stack, versions, constraints, and existing tests.
2. Treat catalog commands, package versions, cloud settings, security advice, and API examples as candidates. The upstream collection can be stale or generic.
3. Verify unstable technical details against current official documentation before implementing them. For OpenAI usage, follow the installed OpenAI documentation skill.
4. Reconcile conflicting recipes with the project's architecture and explicit user requirements. Do not replace a sound stack merely because a recipe uses another one.
5. Implement only when the user's request authorizes changes. A request to explain, review, or plan does not authorize deployment, external writes, purchases, or production mutation.
6. Run project-specific formatting, type, test, build, security, and browser checks appropriate to the change. Report evidence and gaps honestly.

Never execute destructive snippets copied from a recipe without resolving exact targets and confirming they are within scope. Never expose secrets, use real production credentials in examples, or perform penetration/load tests against systems the user has not authorized.

## Output

Mention which catalog recipe paths influenced the solution, what was adapted for the actual project, which current sources were verified, and the validation performed.

## Provenance

Adapted from [HighMark-31/TRAE-Skills](https://github.com/HighMark-31/TRAE-Skills). Search metadata and the upstream license are retained under `references/catalog/`; topic documents are read from the source repository on demand so current content can be reviewed before use.
