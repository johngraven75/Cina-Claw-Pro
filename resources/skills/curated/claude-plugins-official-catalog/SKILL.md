---
name: claude-plugins-official-catalog
description: Search and safely adapt skills from anthropics/claude-plugins-official. Use when the user asks to add or use an official Claude Code plugin, browse that marketplace, or translate one of its workflows to Codex.
---

# Claude Plugins Official Catalog

Prefer a supported native Codex plugin when the requested capability is available. Otherwise load a single relevant upstream skill and adapt it.

## Workflow

1. Run: python scripts/search_catalog.py references/catalog.json "query" --limit 10
2. Identify whether the result is Anthropic-maintained under plugins/ or third-party under external_plugins/.
3. If the user explicitly requests an available native Codex plugin, use the supported plugin installation flow.
4. Otherwise fetch the current SKILL.md from anthropics/claude-plugins-official on GitHub and read only required referenced files.
5. Translate Claude-specific tools, commands, hooks, and plugin settings to current Codex capabilities.
6. Review dependencies and side effects before use; verify outcomes within the user's requested scope.

## Safety boundaries

- Inclusion in the directory is not a guarantee of safety. Inspect each plugin's homepage, source, MCP servers, commands, and license.
- Never install packages, MCP servers, hooks, messaging bridges, OAuth integrations, or external binaries without explicit authorization.
- Do not access Discord, Telegram, iMessage, or other communications unless the user explicitly requests it and recipient/action confirmation requirements are met.
- Do not copy secrets or session data into chat or repository files.
- Prefer existing installed Codex skills when they already cover the task.

Source: https://github.com/anthropics/claude-plugins-official (repository Apache-2.0; external plugins may use different licenses). Catalog entries contain names and paths only.
