---
name: ralphex-update
description: Smart-merge updated Ralphex embedded defaults into customized prompts, agents, and configuration while preserving user intent. Use when the user asks to update, reconcile, or merge Ralphex configuration after upgrading the CLI.
---

# Ralphex Configuration Update

Reconcile customized Ralphex configuration with the current CLI defaults while preserving user intent. Adapted from [umputun/ralphex](https://github.com/umputun/ralphex) under the bundled MIT license.

Do not modify project source, run a Ralphex plan, or touch files outside the resolved configuration directory and an exact temporary directory.

## Verify and extract

Verify `ralphex` is available. If missing, stop and explain that a current binary is required to obtain authoritative defaults; do not install it without authorization.

Create an exact temporary directory and dump the defaults:

```bash
ralphex_defaults_dir=$(mktemp -d /tmp/ralphex-defaults-XXXXXX)
ralphex --dump-defaults "$ralphex_defaults_dir"
```

Retain the exact path for cleanup. Resolve the configuration directory from `RALPHEX_CONFIG_DIR` or the platform default. If it is missing, report that there is nothing to update.

## Classify files

Compare defaults only against corresponding user files:

- Missing, empty, or comment-only user file: skip; embedded defaults already apply.
- Uncommented content equals the default after comment lines are removed from both: skip as current.
- Uncommented content differs: mark for semantic merge.
- User-only file with no corresponding default: leave untouched.

Never offer to install newly introduced default files. Show a summary of skipped and merge-needed files.

## Review each merge

Ask whether the user wants read-only diffs or interactive merges. For each selected file:

1. Read the new default and current customized file.
2. Identify user additions, default structural changes, new template variables, and direct conflicts.
3. Propose a merge preserving user additions and style while incorporating the new structure.
4. Show a concise change summary and the proposed result.
5. Ask the user to accept the merge, keep their file, or replace it with the new default.
6. Before an accepted write, create a backup beside that exact file. Apply only the selected choice.

## Cleanup and report

Clean the exact temporary directory even on cancellation or error. Report counts for skipped, merged, retained, and replaced files plus backup paths. Never delete broad or unresolved paths.
