---
name: cherry-studio-operator
description: Configure, develop, migrate, and troubleshoot Cherry Studio, including providers, assistants, MCP servers, skills, builds, and app data. Use when the user explicitly mentions Cherry Studio or its repository.
---

# Cherry Studio Operator

Use current Cherry Studio documentation and repository-native skills to guide a safe, version-aware workflow.

## Route the task

- Product configuration or troubleshooting: inspect the exact installed version, platform, logs, and relevant user-facing docs.
- Provider or MCP setup: verify the provider/server contract and test with non-secret diagnostics before changing configuration.
- Development: fetch and follow .agents/skills/cherry-electron-dev/SKILL.md.
- Pull-request testing or review: use the matching native skill under .agents/skills/.
- Built-in assistant and skill management: consult resources/builtin-agents/cherry-assistant/.claude/skills/ and resources/skills/.
- Migration: read the current migration guide for the specific data domain and version boundary.

Fetch only the needed current files from CherryHQ/cherry-studio on GitHub. Prefer official docs and repository tests over remembered commands.

## Safety boundaries

- Do not install or launch the desktop app, download binaries, start the API gateway, or modify provider/MCP settings unless the user asks.
- Never request API keys or session tokens in chat. Use the application's secret fields or user-controlled environment/config storage.
- Before editing app data, database files, or migration state, identify exact paths, stop the app when required, and create a recoverable backup.
- Do not rerun, skip, or roll back migrations based only on generic advice.
- Treat issue creation, PR creation, release preparation, and feedback submission as external writes requiring explicit authorization.

Source: https://github.com/CherryHQ/cherry-studio (AGPL-3.0). No application binaries or user data are bundled.
