---
id: seed-private-local-first-boot
title: Seed a private local first-boot agent
scenario: gateway-backend-communication
taskType: runtime-bridge
intent: Give pristine installs a capable zero-hosted-token default without changing upgrades or silently using cloud fallback.
touchedAreas:
  - electron/utils/cina-claw-defaults.ts
  - electron/shared/providers/registry.ts
  - src/lib/providers.ts
  - src/components/models/FreeModelDock.tsx
  - src/pages/Setup/index.tsx
  - shared/i18n/locales/**
  - README*.md
  - RELEASE_NOTES_UNRELEASED.md
  - docs/CARRY_FORWARD.md
  - harness/specs/tasks/seed-private-local-first-boot.md
  - tests/**
expectedUserBehavior:
  - A pristine configuration selects local Ollama qwen3-vl:8b for text, images, reasoning, tools, planning, and delegation.
  - First setup states the Ollama and model prerequisites before the user enters chat.
  - Missing local prerequisites never cause cloud fallback or data transmission.
  - Existing provider and model choices remain unchanged.
requiredProfiles:
  - fast
  - comms
requiredRules:
  - docs-sync
  - comms-regression
requiredTests:
  - pnpm exec vitest run tests/unit/cina-claw-defaults.test.ts tests/unit/providers.test.ts
  - pnpm exec playwright test tests/e2e/setup-local-default.spec.ts --workers=1
  - pnpm run typecheck
  - pnpm run lint:check
  - pnpm run verify:carry-forward
  - pnpm run comms:replay
  - pnpm run comms:compare
acceptance:
  - Seeding occurs only when models and agents.defaults.model are both absent.
  - The default model has explicit text, image, and reasoning metadata.
  - The default model fallback list is empty.
  - All supported locales explain how to install the model.
docs:
  required: true
---

# Seed private local first boot

## Goal

Give a pristine Cina-Claw Pro installation a zero-hosted-token default agent while preserving every existing operator provider and model choice.

## Scope

- Seed local Ollama only when both `models` and `agents.defaults.model` are absent.
- Select `ollama/qwen3-vl:8b` with explicit text, image, and reasoning metadata.
- Keep the existing guarded planning, tool, and subagent orchestration defaults.
- Use an empty fallback chain so a missing local runtime never transmits a request to a cloud provider.
- Explain the Ollama and model download prerequisites on the first setup screen in every supported locale.

## Validation

- `pnpm exec vitest run tests/unit/cina-claw-defaults.test.ts tests/unit/providers.test.ts`
- `pnpm exec playwright test tests/e2e/setup-local-default.spec.ts --workers=1`
- `pnpm run typecheck`
- `pnpm run lint:check`
- `pnpm run verify:carry-forward`

## References

- `harness/specs/scenarios/gateway-backend-communication.md`
- `harness/reference/openclaw-config-delivery.md`
