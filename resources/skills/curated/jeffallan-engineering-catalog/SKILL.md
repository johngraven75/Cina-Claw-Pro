---
name: jeffallan-engineering-catalog
description: Search and safely adapt the 67 full-stack engineering skills from Jeffallan/claude-skills. Use for language and framework expertise, architecture, APIs, databases, cloud, DevOps, SRE, testing, security review, debugging, documentation, specifications, modernization, data engineering, or platform integrations.
---

# Jeffallan Engineering Catalog

Load one relevant upstream specialist and translate its workflow to the current repository and Codex environment.

## Select and load

1. Run: python3 scripts/search_catalog.py references/catalog.json "task keywords" --limit 8
2. Choose the narrowest matching skill; combine specialists only when the task spans distinct domains.
3. Fetch the current full SKILL.md from Jeffallan/claude-skills at the indexed path through the connected GitHub capability.
4. Read only the references required by the selected workflow.
5. Inspect the target repository, project instructions, stack, versions, tests, and deployment context before acting.

## Adapt to Codex

- Translate AskUserQuestion patterns into the available structured-input flow when missing information materially changes the result.
- Use subagents only when current instructions explicitly permit delegation.
- Use installed connectors for Jira, Confluence, GitHub, or other services; do not invent unavailable MCP capabilities.
- Verify technical commands and unstable APIs with current official documentation.
- Prefer existing installed Codex skills when they provide a more direct first-party workflow.

## Scope and safety

A request to review, diagnose, explain, or plan does not authorize implementation or external changes. Treat package installation, commits, pushes, deployments, tickets, documentation publication, infrastructure changes, and messages as separately scoped actions.

Run security and penetration-testing workflows only on systems the user is authorized to assess, within explicit rules of engagement. Do not expose secrets or run disruptive proof-of-concept activity.

Source: https://github.com/Jeffallan/claude-skills (MIT). The adapter loads specialists on demand instead of globally activating overlapping roles and commands.
