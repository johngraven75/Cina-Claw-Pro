---
id: add-reviewed-curated-skills
title: Bundle reviewed curated skills with repository-local provenance
scenario: plugin-lifecycle-management
taskType: plugin-lifecycle
intent: Add the requested reviewed skill adapters to Cina-Claw Pro while preserving the existing official skill bundle, explicit marketplace policy, user-managed files, and reproducible source provenance.
touchedAreas:
  - resources/skills/preinstalled-manifest.json
  - resources/skills/curated/**
  - scripts/bundle-preinstalled-skills.mjs
  - scripts/preinstalled-skill-sources.mjs
  - tests/preinstalled-curated-skills.test.mjs
  - tests/carry-forward-verification.test.mjs
  - harness/specs/scenarios/plugin-lifecycle-management.md
  - harness/specs/rules/preinstalled-skill-source-integrity.md
  - harness/specs/tasks/add-reviewed-curated-skills.md
  - docs/CARRY_FORWARD.md
  - NOTICE.md
  - README.md
  - README.zh-CN.md
  - README.ja-JP.md
  - README.ru-RU.md
  - package.json
expectedUserBehavior:
  - A fresh installation deploys and enables 17 reviewed official skills and 38 reviewed Cina adapters.
  - Existing user-managed skill directories are never overwritten.
  - Existing preinstalled skills with a different marker version remain untouched for manual reconciliation.
  - Marketplace skills and plugins still require an explicit user install.
  - Loading an adapter does not itself install an external runtime, start a service, connect an account, or spend provider funds.
requiredProfiles:
  - fast
requiredRules:
  - capability-owner-resolution
  - preinstalled-skill-source-integrity
requiredTests:
  - node --test tests/preinstalled-curated-skills.test.mjs
  - pnpm exec vitest run tests/unit/preinstalled-skill.test.ts
  - pnpm run verify:carry-forward
  - pnpm run bundle:preinstalled-skills
acceptance:
  - The manifest has 55 unique slugs: 17 remote official entries and 38 repository-local adapters.
  - Every local adapter is auto-enabled, versioned, name-aligned, and contained under resources/skills/curated.
  - Local path validation blocks ambiguous sources and repository traversal.
  - The packaged lock records source provenance for remote and local entries.
  - The official Anthropic entries and their behavior remain unchanged.
  - All four README languages and the carry-forward registry describe the reviewed bundle accurately.
docs:
  required: true
---

Use this task spec when adding, removing, updating, or changing the source model for reviewed preinstalled skills.
