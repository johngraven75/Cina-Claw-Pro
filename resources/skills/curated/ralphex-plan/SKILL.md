---
name: ralphex-plan
description: Create structured implementation plans in docs/plans for Ralphex execution. Use when the user asks for a Ralphex plan, implementation plan for Ralphex, or a dependency-ordered plan with per-task tests and parser-compatible checkboxes.
---

# Ralphex Plan

Create a parser-compatible implementation plan without implementing it. Adapted from [umputun/ralphex](https://github.com/umputun/ralphex) under the bundled MIT license.

## Discover before drafting

1. Inspect the repository, relevant code, tests, documentation, configuration, and recent changes.
2. Summarize the inferred goal, scope, dependencies, constraints, and existing patterns.
3. Ask only questions whose answers materially affect the plan. Offer concrete options when possible.
4. If multiple viable approaches remain, present two or three with tradeoffs and get the user's choice. Skip this when the path is already specified or obvious.

An installed `ralphex` CLI is not required to create a plan. If it is absent, mention that it will be needed only when the user later executes the plan.

## Write the plan

Create `docs/plans/YYYYMMDD-<slug>.md`. Never overwrite an existing file without confirmation. Use these sections:

- `# <title>`
- `## Overview`
- `## Context`
- `## Development Approach`
- `## Testing Strategy`
- `## Progress Tracking`
- optional `## Technical Details`
- `## Implementation Steps`
- optional `## Post-Completion`

Inside Implementation Steps, use `### Task N: <specific outcome>`. The structural word `Task` must remain English because the Ralphex parser depends on it. Put checkboxes only inside Task sections. External or manual actions belong in Post-Completion without checkboxes.

Each task must be one dependency-ordered logical unit and include:

- concrete actions with file or component references;
- tests for changed behavior, including important failure paths;
- the project-specific command that must pass before the next task.

End with `### Task N: Verify acceptance criteria`, covering all requirements, the full relevant test suite, lint/type/build checks, and documentation updates where needed. Do not invent a coverage threshold unless the project defines one.

## Quality gate

Before saving, verify that the plan reflects the repository, decisions and constraints are explicit, dependencies are ordered, every code-changing task has tests, all checkboxes are under Task sections, and the final task proves the Overview. Report the created path and that no implementation was performed.
