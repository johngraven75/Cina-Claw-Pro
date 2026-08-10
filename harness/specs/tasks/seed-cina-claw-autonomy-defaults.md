---
id: seed-cina-claw-autonomy-defaults
title: Seed guarded Cina-Claw Pro autonomy defaults
scenario: gateway-backend-communication
taskType: runtime-bridge
intent: Enable planning, bounded code mode, and sub-agent delegation on first launch while preserving explicit operator choices and requiring review for commands outside the allowlist.
touchedAreas:
  - harness/specs/tasks/seed-cina-claw-autonomy-defaults.md
  - .github/**
  - .gitignore
  - AGENTS.md
  - LICENSE
  - README*.md
  - SECURITY.md
  - NOTICE.md
  - RELEASE_NOTES_v1.0.0.md
  - docs/**
  - electron-builder.yml
  - electron/main/menu.ts
  - electron/main/tray.ts
  - electron/main/updater.ts
  - electron/shared/providers/registry.ts
  - electron/utils/cina-claw-defaults.ts
  - electron/utils/openclaw-auth.ts
  - electron/utils/openrouter-headers-preload.cjs
  - index.html
  - package.json
  - pnpm-lock.yaml
  - resources/**
  - scripts/**
  - shared/i18n/locales/**
  - src/**
  - tests/**
expectedUserBehavior:
  - A fresh installation can plan multi-step work, run bounded code-mode tool batches, and delegate to sub-agents.
  - Host commands outside the executable allowlist require operator review.
  - Existing explicit autonomy and execution-policy settings are never overwritten.
requiredProfiles:
  - fast
  - comms
requiredRules:
  - renderer-main-boundary
  - backend-communication-boundary
  - gateway-readiness-policy
  - comms-regression
  - docs-sync
requiredTests:
  - pnpm exec vitest run tests/unit/cina-claw-defaults.test.ts tests/unit/openclaw-auth.test.ts
  - pnpm run typecheck
  - pnpm run lint:check
  - pnpm run comms:replay
  - pnpm run comms:compare
acceptance:
  - Missing autonomy fields receive bounded defaults without changing explicit operator values.
  - Host execution defaults to gateway, allowlist, and approval on misses.
  - Existing Renderer-to-Main and Main-to-Gateway paths do not change.
docs:
  required: true
---

## Scope

Seed missing first-run OpenClaw configuration during the existing Main-owned sanitization pass. Do not add a new Renderer bridge or weaken Gateway authentication.

## Out of scope

- Unrestricted host execution.
- Overwriting operator-configured policy.
- Installing unreviewed marketplace code.
