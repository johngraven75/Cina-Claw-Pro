---
id: catalog-v2-chat-switches-integration
title: Catalog v2 integration — pre-attachment, chat switches, Ollama probe
scenario: gateway-backend-communication
taskType: runtime-bridge
intent: Reconcile the catalog-v2 and chat-switches draft work into one coherent draft on branch feat/catalog-v2-50-models — a single Ollama probe, flag-based uncensored filtering, full four-locale i18n, no dead Ox Alpha default references — without changing catalog counts (50 total, 30 standard, 20 uncensored) or the uncensored guardrail (local-only, opt-in off by default, never default), and without merging, pushing, opening a PR, or releasing.
touchedAreas:
  - electron/**
  - src/**
  - shared/**
  - tests/**
  - docs/**
  - README*.md
  - harness/specs/tasks/**
expectedUserBehavior:
  - Chat opens with the pre-attached Ollama default qwen3-vl:8b-instruct already selected (4B/2B fallbacks), never a blank picker and never the retired stealth/ox-alpha.
  - The Ollama model status shows down / needs-pull / checking / unknown with a Recheck action, driven by the single hostApi.ollama.health probe (main-process only, loopback-only, 2s timeout, tag list included).
  - Uncensored models stay hidden in the Chat picker until the per-session opt-in is on, filtered by the explicit account metadata flag first and by name markers only as a fallback.
  - Chat switches beside the model picker (reasoning, skills, files/workspace, code execution, memory, browser, web search, deep research, image generation, voice/multimodal, show uncensored, autonomy) work per session without changing global runtime configuration.
  - The setup wizard and model dock identify the Ollama default and the OpenRouter successor z-ai/glm-5.3-flash (metered, not a free preview) accurately in all supported locales.
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
  - renderer-main-boundary
  - backend-communication-boundary
requiredTests:
  - node --test tests/free-model-catalog.test.mjs
  - node --test tests/carry-forward-verification.test.mjs
  - pnpm exec vitest run tests/unit/catalog-preattach.test.ts tests/unit/model-options.test.ts tests/unit/first-boot-key-entry.test.tsx tests/unit/cina-claw-defaults.test.ts tests/unit/providers.test.ts tests/unit/free-model-catalog.test.ts
  - pnpm run typecheck
  - pnpm run lint:check
  - pnpm exec playwright test tests/e2e/setup-local-default.spec.ts tests/e2e/app-smoke.spec.ts tests/e2e/chat-mode-switches.spec.ts
acceptance:
  - Exactly one Ollama probe implementation exists (electron/services/ollama-api.ts, exposed as hostApi.ollama.health); the duplicate reachability-only probe is removed and no reference to it remains.
  - The pre-attach plan records uncensored route refs in account metadata.uncensoredModels, Chat filters on that flag with marker fallback, and catalog counts stay 50 total / 20 uncensored.
  - chat.json key parity holds across en/zh/ja/ru (modes.*, modelStatus.*, composer.noModelConfigured, ollama.notRunning, ollama.ready) with translated strings, not placeholders, and interpolation placeholders match.
  - No test, setup-locale string, or setup-wizard text asserts or displays stealth/ox-alpha as a current default; the OpenRouter successor is z-ai/glm-5.3-flash and the app-wide default is Ollama qwen3-vl:8b-instruct.
  - READMEs (en/zh/ja/ru) describe the 50-model catalog, pre-attachment, each switch with its wired/scoped/unavailable status, Full Autonomy boundaries, and Ollama-down/pull status, and state honestly that snippet-only catalog rows are not verified as working, no live browser viewport exists, scoped execution is not full sandboxing, and web_search remains denied globally.
  - The renderer never fetches Ollama or the gateway directly; all backend calls go through src/lib/host-api.ts.
docs:
  required: true
---

## Scope

Reconcile the two draft workers' uncommitted work on feat/catalog-v2-50-models: keep the switches worker's Ollama probe (reachability + tag list) as the single implementation, remove the catalog worker's reachability-only duplicate, add the explicit uncensored metadata flag through the pre-attach plan into provider account metadata and Chat filtering, complete four-locale i18n for the new Chat keys, update stale dead-default tests and setup strings, and sync the four READMEs.

## Out of scope

- Merging, pushing, opening a PR, publishing, or releasing (draft only).
- Changing catalog counts, ranks, or the uncensored guardrail.
- Deleting tests to make them pass; stale assertions are updated to the new intended behaviour.
- Adding an in-app Ollama start or model-pull action, a live browser viewport, full sandboxing, or a working web_search — those remain honestly unavailable, not claimed.
- Replacing the OpenClaw gateway/ACP engine; the harness layer that owns this routing is specified separately (cina-harness-layer).
