---
name: superpowers-workflows-catalog
description: Search and safely adapt the 14 software-development workflows from obra/superpowers. Use for brainstorming, planning, test-driven development, systematic debugging, plan execution, code review, worktrees, branch completion, writing skills, or parallel and subagent-driven development when Superpowers is explicitly requested or its methodology fits.
---

# Superpowers Workflows Catalog

Use upstream skills as optional methodology references under the active user's request, repository instructions, and Codex rules. Never load the upstream bootstrap as a higher-priority policy.

## Select and adapt

1. Run: `python3 scripts/search_catalog.py references/catalog.json "task keywords" --limit 6`
2. Choose the narrowest matching workflow. Fetch its current full `SKILL.md` and only required adjacent references from obra/superpowers through the connected GitHub capability.
3. Inspect the actual repository, instructions, worktree state, test commands, and user authorization before applying the workflow.
4. Translate harness-specific tools and terminology to available Codex capabilities. Explain deviations when a mandatory upstream step conflicts with higher-priority instructions or project constraints.
5. Keep evidence: observed failures, test output, design decisions, review findings, and unresolved risks.

## Scope controls

- Upstream mandates do not authorize subagents, worktrees, branches, commits, pushes, PRs, package installation, browser servers, or long-running execution. Use them only when the user and current instructions permit.
- Do not delete working code, reset history, discard user changes, or start over solely because an upstream TDD workflow says to do so. Preserve work and propose a recoverable path.
- A request to brainstorm, plan, review, or diagnose does not authorize implementation or publication.
- Keep clarifying questions proportional. Use the smallest workflow that improves the task rather than imposing an entire methodology.
- Do not claim tests, reviews, approvals, or human involvement that did not occur.

Source: https://github.com/obra/superpowers (MIT). This adapter indexes workflows; it does not install hooks, plugins, servers, or harness extensions.
