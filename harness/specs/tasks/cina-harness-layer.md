---
id: cina-harness-layer
title: Cina harness layer — own orchestration over the OpenClaw engine
scenario: gateway-backend-communication
taskType: runtime-bridge
intent: Build Cina-Claw's own harness layer (the Cina harness layer, not a rebrand of OpenClaw) on branch feat/catalog-v2-50-models: a clean harness core that the Chat UI, switches, and TaskView talk to, with an engine-adapter interface underneath. The initial default engine adapter is the existing OpenClaw gateway/ACP path — the engine is NOT replaced in this draft, and existing sessions, provider accounts, skills, channels, and cron are NOT broken. A DirectAdapter for OpenAI-compatible Ollama/OpenRouter chat is defined and stubbed honestly until a host proxy route exists.
touchedAreas:
  - electron/**
  - src/**
  - shared/**
  - tests/**
  - docs/**
  - README*.md
  - harness/specs/tasks/**
expectedUserBehavior:
  - Chat keeps working exactly as before through the OpenClaw gateway/ACP engine; no session, provider account, skill, channel, or cron behaviour changes.
  - The Chat modes panel shows a harness Engine section: OpenClaw gateway selected by default, Direct shown disabled with a stub note that it is not available yet.
  - Turns are routed by the harness: the catalog-v2 pre-attached Ollama default (qwen3-vl:8b-instruct, 4B/2B fallbacks), never the dead stealth/ox-alpha or DeepSeek-R1 models.
  - Switch state, tool routing, the approval queue, and a timestamped activity log are owned by the harness and visible in one place; dangerous actions still pause for approval and Full Autonomy never auto-approves.
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
  - pnpm exec vitest run tests/unit/harness-routing.test.ts tests/unit/harness-adapters.test.ts tests/unit/harness-store.test.ts tests/unit/catalog-preattach.test.ts tests/unit/model-options.test.ts
  - pnpm run typecheck
  - pnpm run lint:check
  - pnpm exec playwright test tests/e2e/harness-engine.spec.ts tests/e2e/chat-mode-switches.spec.ts
acceptance:
  - src/lib/harness/ defines the EngineAdapter interface and the engine registry; UI, switches, and catalog code never import an engine directly.
  - The OpenClaw adapter is fully implemented and delegates transport to the injected ACP path (hostApi.chat.sendAcpPrompt via the existing session store); it adds routing, turn plans, and capability declarations, and reimplements nothing.
  - The DirectAdapter is a clearly-marked stub: available=false with a stated reason (no host route for OpenAI-compatible chat exists yet and the renderer must not fetch Ollama or the gateway directly), all capabilities false, sendSimpleChat returns ok:false — it never fakes a reply and never silently falls back.
  - The harness store owns engine selection (requested vs effective), the metadata-only activity log (capped, never prompt text or tool I/O), the approval queue mirrored from ACP permission requests (including auto-declines with their reason), and the harness-session binding.
  - Tool routing reports web_search/deep-research search steps as denied-globally when switched on, exec as allowed only under allowlist + ask-on-miss, and memory/image-generation as directive-only — never claiming enforcement that does not exist.
  - Harness i18n keys (harness.*) have full en/zh/ja/ru coverage with key parity, and the renderer adds no new direct window.electron.ipcRenderer.invoke calls and no direct gateway HTTP fetches.
  - READMEs (en/zh/ja/ru) describe the harness layer, what OpenClaw still provides versus what the harness owns, and the DirectAdapter stub status.
docs:
  required: true
---

## Scope

Add src/lib/harness/ (types, tool routing, model routing, OpenClaw adapter, DirectAdapter stub, engine registry), src/stores/harness.ts, additive wiring in the ACP chat session store (turn lifecycle + approval mirroring, metadata only) and the Chat modes panel (engine section + session binding), harness.* i18n in four locales, harness unit tests, a harness engine E2E spec, README sync, and this spec.

## Out of scope

- Merging, pushing, opening a PR, publishing, or releasing (draft only).
- Replacing the OpenClaw engine, or reimplementing sessions, channels, cron, skills execution, or the plugin runtime.
- A working DirectAdapter transport: that needs a new main-process host proxy route for OpenAI-compatible chat, which is follow-up work, not smuggled into this draft by fetching from the renderer.
- Changing catalog counts, ranks, or the uncensored guardrail.
- Storing prompt text or tool I/O in the activity log, or auto-approving anything under any autonomy level.
