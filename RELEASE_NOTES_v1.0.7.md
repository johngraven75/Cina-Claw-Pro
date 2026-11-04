# Cina-Claw Pro v1.0.7

## Release summary

Cina-Claw Pro v1.0.7 ships catalog v2, the Cina harness layer, chat switches,
pre-attached models, and an autoconfig gate so a fresh install works out of
the box instead of dead-ending on a retired or unpulled model. It builds on
v1.0.6 (media downloads, un-gated image generation, README skill count);
nothing from v1.0.6 is removed.

## Included changes

### Catalog v2 — 50 models (PR #27)

- 50-model free catalog: 30 standard models + 20 uncensored models (ranks
  31–50). Uncensored models are local-only, hidden until an explicit opt-in
  is turned on, and are never the default.
- Verified model IDs only; text-only uncensored rows are labelled as such
  where a multimodal row could not be verified.

### Pre-attachment — Chat opens with a working default

- Models are pre-attached to their providers, so Chat opens with a default
  already set: Ollama Qwen3-VL 8B Instruct, with 4B and 2B Instruct builds as
  lower-VRAM fallbacks. No manual provider/model selection is needed first.
- The retired OpenRouter stealth/ox-alpha (404 — testing period ended) is
  never seeded as a default again and is refused by the harness dead-model
  denylist, along with Hugging Face deepseek-ai/DeepSeek-R1 (402 billing /
  cooldown). The OpenRouter featured pick is now its successor,
  z-ai/glm-5.3-flash (metered, not a free preview), and its featured-card
  label has been corrected to say so. The app-wide keyless default remains
  the local Ollama model, not the metered OpenRouter pick.

### Chat switches — wired to real capabilities

- Switches near the model picker for reasoning, skill use, deep research /
  reasoning, chat with files, Use Browser, web search, tools/code execution
  (ask-on-miss approvals preserved), files/workspace, memory, image
  generation where supported, and voice/multimodal where already wired.
  Switches are not dead toggles: deep research uses a scoped toolset and
  shows sources, and the browser switch is fetch/navigate plus an activity
  log (no live viewport is claimed unless built).
- Full Autonomy levels Off / Supervised (default) / Full Autonomy: Full
  Autonomy continues multi-step tasks unattended with a full activity log
  and Stop control, but never crosses hard boundaries — no deleting repos
  or files outside workspace scope, no history rewrites, no committing
  secrets, no bypassing approvals, sign-ins, or deletion protections, no
  sending messages/payments/publishing without explicit approval, and no
  scope expansion. Dangerous actions pause for approval; genuine blockers
  stop the task.

### Cina harness layer and harness bridge

- New harness core owns session orchestration, provider/model routing
  (catalog v2 pre-attachment), switch state, tool routing, approval queue,
  and activity log, over an engine-adapter interface with the OpenClaw
  gateway/ACP as the initial default. A DirectAdapter for OpenAI-compatible
  Ollama/OpenRouter chat is included as the simple-chat path.
- The release workflow's harness bridge (`pnpm run ext:bridge`, via
  `scripts/generate-ext-bridge.mjs`) is part of this build and runs in the
  release workflow's verify-source step.

### Autoconfig gate (new in v1.0.7) — fresh installs work out of the box

- **One-click Ollama start:** when Ollama is not running, Chat now offers a
  "Start Ollama" button (main process, loopback only). If the Ollama binary
  is missing it says so plainly — install Ollama, then retry — instead of
  spinning or failing silently.
- **One-click model pull:** when the selected model is not pulled, Chat now
  offers a "Pull" button for it. Pulls are allowlisted to the pre-attached
  Qwen3-VL 8B/4B/2B builds only; a renderer request cannot pull an
  arbitrary, retired, or unrelated model.
- **Pulled-fallback switch:** when the selected model is not pulled but a
  pre-attached fallback (4B/2B) already is, Chat offers a one-tap switch to
  it. An already-installed unrelated model is offered only if it is already
  a configured option, and is otherwise shown as an installed-model hint
  (add it in Settings > AI Providers) — never silently substituted.
- **Autoconfig resolution (main process):** `hostApi.ollama.autoconfig`
  probes Ollama, best-effort starts it if down, then selects the first
  pulled pre-attached model in priority order (8B, then 4B, then 2B) and
  reports any other installed model only as an explicit offer.
- **Already in place and verified in this release:** gateway config
  validation with migration of the old CodeMode schema, the config-seed
  fallback chain (primary + 4B/2B fallbacks, with empty-override
  suppression so a hand-configured empty list does not kill the chain),
  the dead-model denylist, skippable first-boot OpenRouter key entry (the
  v1.0.5 single-key entry is not re-prompted or broken), and the Ollama
  health status display (up + pulled = ready; up + not pulled = needs
  pull; down = needs Ollama; failed probe = unknown, never ready).
- **Precisely labelled limit:** auto-start cannot install Ollama, and
  auto-pull cannot fetch a model the user has not approved via the
  allowlisted button. Those two cases show clear guidance instead of
  claiming full autoconfig.

### CodeAnt review fixes (PR #27 head 12358a7, triaged on the merged tree)

- CRITICAL, fixed: the Ollama `/api/tags` probe now caps the buffered body
  at 1 MB (it previously buffered unbounded), and the model-pull process
  output is capped at 10 MB instead of the 1 MB execFile default that could
  fail long pulls spuriously.
- MAJOR, fixed: fallback models (Qwen3-VL 4B/2B) are now registered in the
  Ollama provider's models list at seed time, not only in
  defaults.model.fallbacks, so OpenClaw can actually route to them.
- MAJOR, fixed: saved configs still pointing at the retired OpenRouter
  stealth/ox-alpha are migrated on config load to the successor
  z-ai/glm-5.3-flash (same provider), including agent overrides and
  provider model entries — existing installs no longer 404 forever.
- MAJOR, fixed: the catalog pre-attach planner is now wired into provider
  load (providers store, once per session, only when the plan would change
  an account, failures logged not thrown). Its apply loop now honors
  setAsDefault for the account-model patch too (metadata-only when false),
  and OpenRouter accounts now honor pre-attached customModels in the Chat
  options (selected model first; other built-ins keep the tested
  stale-metadata behavior).
- MAJOR, fixed: hiding uncensored models no longer permanently clears a
  valid saved model override — the clear check now uses the unfiltered
  options.
- MAJOR, fixed: @-routed sends now gate attachments and skill tokens by
  the target session's mode, not the current session's (Chat/index.tsx
  already re-gated by target mode; ChatInput now matches it).
- MAJOR, fixed: skill-token stripping no longer mangles paths, URLs, or
  double spaces (tokens are now slash + bare skill name + two-space
  delimiter only), and the featured-card label/testids no longer say
  Ox Alpha — they say GLM successor (the model served was already the
  successor; only the label was stale).
- MAJOR, fixed by correcting the text (not by inventing enforcement):
  Full Autonomy README text no longer guarantees boundaries the code does
  not enforce — it now says the model is instructed never to cross them
  and that enforcement is the existing approval cards plus the exec
  allowlist/ask-on-miss policy, not a separate sandbox. The Ollama
  start/pull README text was likewise updated from "no action yet" to the
  new actions.
- False-positive sub-claim, recorded not fixed: setupOnly rows are not
  "ignored" by the apply loop — HF-local rows have no provider account to
  update by construction, and their only meaning is "download/pull still
  required."

## Validation expectations

The release must pass type checking, linting, unit and integration tests,
production Vite build, Electron E2E, Windows packaging, checksum
generation, and release artifact inventory. For this release-prep change
specifically, verified locally before merge: web + node typecheck clean,
lint 0 errors (7 pre-existing fast-refresh warnings), Vite build green,
harness CI green, both harness task specs valid, and the new
ollama-autoconfig unit tests 4/4 green, plus the CodeAnt-fix unit tests
(retired-model migration, pre-attach setAsDefault gating, OpenRouter
customModels, skill-token stripping).

Windows installers are unsigned unless the repository is supplied with a
trusted Windows signing identity. Windows SmartScreen may display a warning
for unsigned artifacts.

## Known limitations (honest, at release preparation time)

- A live installed-Windows run of this build (fresh install: chat with the
  Ollama default, Start Ollama / Pull flow, a pulled-fallback switch, and
  an HLS + site-video download) has not yet been observed on real Windows.
  Do not treat this release as live-Windows-verified until that run is done.
- The separate check / win-build-test / electron-e2e workflows still have
  no observed runs on this head; the release workflow's own verify-source
  + package-windows steps are the Windows evidence for this release.
- One unit test file, tests/unit/chat-input.test.tsx, failed at import time
  in this environment (its react-i18next mock was missing initReactI18next,
  which src/i18n requires via acp-chat-session) — proven pre-existing on
  the pristine merged main tree, not caused by this release-prep change,
  and fixed in this release-prep change by completing the mock the way
  sibling tests already do. It is no longer a known failure.
