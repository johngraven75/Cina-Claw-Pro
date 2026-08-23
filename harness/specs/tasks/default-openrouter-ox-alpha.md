---
id: default-openrouter-ox-alpha
title: Default OpenRouter to Ox Alpha
scenario: gateway-backend-communication
taskType: runtime-bridge
intent: Make OpenRouter Ox Alpha the synchronized first-boot and provider-setup default on Windows, macOS, and Linux without overwriting existing operator choices.
touchedAreas:
  - harness/specs/tasks/default-openrouter-ox-alpha.md
  - shared/openrouter.ts
  - electron/shared/providers/registry.ts
  - electron/utils/cina-claw-defaults.ts
  - electron/utils/openrouter-free-compat.ts
  - src/lib/providers.ts
  - src/components/models/FreeModelDock.tsx
  - src/pages/Setup/index.tsx
  - shared/i18n/locales/**
  - README*.md
  - RELEASE_NOTES_UNRELEASED.md
  - docs/CARRY_FORWARD.md
  - tests/**
expectedUserBehavior:
  - A fresh installation seeds OpenRouter model `stealth/ox-alpha` as the primary agent model.
  - Adding an OpenRouter account with a blank model field selects `stealth/ox-alpha`.
  - The setup wizard and model dock identify Ox Alpha and its external OpenRouter prerequisite accurately in all supported locales.
  - Existing provider accounts, model selections, fallbacks, credentials, headers, and concurrency choices remain unchanged.
requiredProfiles:
  - fast
  - comms
  - e2e
requiredRules:
  - active-config-guards
  - provider-default-invariant
  - provider-model-metadata-preservation
  - provider-model-selection-authority
  - ui-i18n-design-tokens
  - docs-sync
requiredTests:
  - pnpm exec vitest run tests/unit/cina-claw-defaults.test.ts tests/unit/openrouter-free-compat.test.ts tests/unit/providers.test.ts
  - pnpm run verify:carry-forward
  - pnpm run typecheck
  - pnpm run lint:check
  - pnpm exec playwright test tests/e2e/setup-local-default.spec.ts tests/e2e/app-smoke.spec.ts
acceptance:
  - Shared OpenRouter constants are the single source of truth for the default provider model.
  - The runtime reference is `openrouter/stealth/ox-alpha` and the provider model ID is `stealth/ox-alpha`.
  - Seeded model metadata records text and image input, reasoning support, a 1,048,576-token context window, and a 131,072-token output limit.
  - The legacy `openrouter/free` route remains recognized as a supported no-cost operator choice.
  - The shared implementation is covered by the Windows, macOS, and Linux Electron E2E matrix.
docs:
  required: true
---

## Scope

Update the shared provider registry, first-boot OpenClaw seed, provider setup defaults, localized onboarding, model dock, and carry-forward verification to use OpenRouter's `stealth/ox-alpha` model.

## Out of scope

- Replacing or migrating an existing operator-selected model.
- Adding an OpenRouter API key to source control.
- Guaranteeing an external preview model's future price, quota, availability, identity, or retention terms.
- Changing transport ownership, Gateway authentication, or Renderer/Main communication paths.
