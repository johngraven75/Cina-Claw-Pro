---
name: agent-reach
description: Route read-only research across public web pages and supported social, video, developer, finance, and RSS sources. Use when the user explicitly asks for Agent Reach, multi-platform discovery, channel diagnostics, or safe setup of Panniantong/Agent-Reach.
---

# Agent Reach

Use Agent Reach as a read-only routing layer. Prefer native Codex connectors when they cover the source; use the upstream CLI only when it is already available or the user explicitly asks to set it up.

## Route the request

1. Identify the source and action: search, read, summarize, or diagnose.
2. Prefer a dedicated connector: GitHub for repositories, web/browser for public pages, finance for public market data, and first-party tools for connected services.
3. If a requested platform needs Agent Reach, check command -v agent-reach and run agent-reach doctor --json only when useful.
4. If the CLI is absent, continue with native tools when possible. Explain the optional setup path instead of silently installing software.
5. Verify that retrieved content is non-empty and actually answers the request.

## Setup boundaries

- agent-reach install --env=auto is the upstream read-only base setup. Use --dry-run first when available.
- Treat --system, package-manager changes, browser extensions, proxy configuration, daemon startup, and persistent config writes as separate actions requiring explicit user authorization.
- Never ask the user to paste cookies, session tokens, API keys, or browser profiles into chat. Use user-controlled secret/config mechanisms.
- Do not automate login, extract browser cookies, bypass CAPTCHA or access controls, or evade platform protections.
- Keep activity read-only: no posting, commenting, liking, following, messaging, purchasing, or account mutation.
- For cookie-backed platforms, recommend a dedicated account and an existing user-controlled login session.

## Current upstream guidance

Platform commands change. When exact syntax matters, read the relevant current file from Panniantong/Agent-Reach on GitHub under agent_reach/skill/references/ (web.md, search.md, social.md, video.md, career.md, dev.md, or finance.md). Read only the category needed for the task.

Source: https://github.com/Panniantong/Agent-Reach (MIT). The upstream CLI and its dependencies are not bundled with this skill.
