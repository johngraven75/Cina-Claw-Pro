---
name: ralphex-adopt
description: Convert OpenSpec, spec-kit, GitHub or GitLab issues, task lists, and free-form Markdown into Ralphex-format plans in docs/plans. Use for "ralphex-adopt", "adopt plan", "convert plan to ralphex", or "import plan as ralphex" requests.
---

# Ralphex Plan Adoption

Convert one existing source into a parser-compatible Ralphex plan at `docs/plans/YYYYMMDD-<slug>.md`. Adapted from [umputun/ralphex](https://github.com/umputun/ralphex) under the bundled MIT license.

The source is never modified. Existing targets are never silently overwritten. Do not change code, run tests, commit, or launch Ralphex.

## Resolve and classify

Resolve exactly one source:

1. For a GitHub issue or pull request URL/reference, use the connected GitHub capability. For GitLab, use an available authenticated connector or CLI.
2. For a local file, read it. For a directory, inspect proposal, task, spec, and plan documents.
3. For a bare name, use `rg --files` to find plausible matches and ask when ambiguous.
4. For another URL, retrieve it only when permitted; otherwise ask the user to paste the content.
5. If no source was provided, ask for pasted content, a path, or an issue reference.

Classify the source as OpenSpec, spec-kit, an issue checklist, a generic task list, or free-form Markdown. Ask before drafting when signals conflict, grouping materially affects scope, a task is vague, or the source size makes the intended scope uncertain. Never emit `TBD`, `???`, or `FIXME` placeholders.

## Convert

Every plan must start with an H1 title and use, in order: Overview, Context, Development Approach, Testing Strategy, Progress Tracking, optional Technical Details, Implementation Steps, and optional Post-Completion.

Inside Implementation Steps:

- Use `### Task N: <title>`; keep the structural word `Task` in English for the parser.
- Put checkboxes only inside Task sections.
- Preserve completed checkbox state from the source.
- Add test-writing and project-test checkboxes to every code-changing task.
- End with `### Task N: Verify acceptance criteria` covering the suite, lint/type/build checks, and Overview requirements.

Map source formats deliberately:

- OpenSpec: proposal motivation to Overview; changes and constraints to Context; spec deltas to Technical Details; numbered task groups to Tasks.
- spec-kit: specification to Overview and Context; architecture to Technical Details; phases to Tasks.
- Issue checklist: title to plan title, introductory prose to Overview, labels/source to Context, and checklist groups to Tasks.
- Generic list: headings to logical Tasks and list items to checkboxes. Ask before splitting an ambiguous flat list.
- Free-form text: preserve stated intent and constraints, then decompose only implied work into three to seven dependency-ordered Tasks.

External or manual actions belong under Post-Completion without checkboxes. Do not invent steps not supported by the source.

## Save and report

Choose a descriptive dated slug and cite the source identifier in Context. Confirm there are no checkboxes outside Task sections, write the new file, and report its path. An installed `ralphex` CLI is needed only for later execution, not conversion.
