---
name: context7-docs
description: Retrieve current, version-aware library and framework documentation with Context7 or authoritative fallback sources. Use when the user asks for Context7, current API syntax, library setup, migration guidance, or examples that may have changed.
---

# Context7 Docs

Resolve the exact library and version, then retrieve focused documentation for the user's concrete question.

## Workflow

1. Identify the package, ecosystem, version, and requested concept. Inspect the project manifest or lockfile when available.
2. If Context7 tools are callable, resolve the library ID before querying documentation. Make one focused query per concept and use no more than three Context7 calls for one question.
3. If Context7 is unavailable, browse current official documentation or the primary repository. For technical answers, use primary sources only.
4. Reconcile documentation with the version actually used by the project. Say when the docs target a different version.
5. Return a compact answer with the resolved library ID when applicable, a minimal example, and source links.

## Privacy and setup

- Never send secrets, credentials, proprietary source code, personal data, or large private files to a documentation service. Reduce queries to public package names and abstract technical concepts.
- Treat OAuth, npx ctx7 setup --codex, config.toml edits, AGENTS.md edits, and MCP-server registration as explicit setup actions. Do not run them unless the user asks for setup.
- Do not invent Context7 results when its tools are absent. State that the authoritative-source fallback was used.
- Prefer an installed native Context7 connector/plugin if one becomes available.

Source: https://github.com/upstash/context7 (MIT). No Context7 service credentials are bundled.
