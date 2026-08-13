---
name: ralphex
description: Launch and monitor Ralphex autonomous implementation-plan execution from Codex. Use when the user asks to run Ralphex, execute a plan with Ralphex, start a Ralphex review or Codex-only loop, or check an active Ralphex session.
---

# Ralphex Runner

Launch only after the user explicitly asks to execute or review a plan. This skill starts Ralphex, retains its execution-session identifier, and reports evidence from its progress file. It does not implement the plan itself.

Adapted from [umputun/ralphex](https://github.com/umputun/ralphex) under the bundled MIT license.

## Verify the CLI

Run:

```bash
command -v ralphex
ralphex --version
```

If unavailable, explain current installation choices from the upstream release page or Go module. Install only when the user's request authorizes installation, and verify the current release instructions before doing so.

## Resolve the run

Determine these values from the request, asking concise questions only when missing:

- **mode:** full execution, review pipeline, or Codex-only review;
- **plan:** an explicit file, the most recent applicable file under `docs/plans/`, or no plan where the selected review mode permits it;
- **iteration limit:** default 50 unless the user chooses another supported limit.

Use `rg --files docs/plans` to discover plans. For full execution, require a plan. For review modes, allow no plan only if the installed Ralphex version supports reviewing current changes without one. Do not guess among multiple plausible plans.

Before launch, inspect `git status`, confirm the plan exists, and state that Ralphex may modify and commit repository files according to its configuration. Do not run it against production systems or credentials without separate authorization.

## Launch

Build the command from verified CLI help:

```bash
ralphex [--review | --codex-only] [--max-iterations N] [plan-file]
```

Run it in a PTY shell execution session and yield after startup. Save the returned session ID. Do not claim the process survives the conversation unless it was launched through a verified persistent process manager.

Determine the progress path from the installed version's behavior. Common paths are under `.ralphex/progress/` and incorporate the plan stem and review mode. Do not invent a filename when it can be observed from startup output or the directory.

## Confirm startup

Poll the execution session and inspect the latest progress lines. Report:

- session ID;
- selected plan and mode;
- branch or worktree, when shown;
- progress-file path;
- exact manual monitoring command.

If startup fails, report the exit status and relevant sanitized error. Do not silently relaunch with broader permissions or different flags.

## Check status

Only when the user asks for a status update:

1. poll the retained execution session without blocking for long periods;
2. read recent progress lines;
3. identify the active phase and iteration;
4. report whether it is running, completed, paused, or failed.

Do not claim success solely because the process exited; require a zero exit status and a successful final progress summary. Redact secrets and sensitive paths.

## Scope

This skill launches and monitors Ralphex only. It does not push branches, open pull requests, deploy, message people, rotate credentials, or perform unrelated repository work unless the user separately requests and authorizes those actions.
