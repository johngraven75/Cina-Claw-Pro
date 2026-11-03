# Cina-Claw Pro — competitor gap plan (Codex / ChatGPT / Gemini / Claude / Manus / Tasks)

> Working plan, English only for now — not user documentation yet. User-facing text and its zh/ja/ru translations land with the picker UI in step 1, per `docs/AGENTS.md`. All external free-tier availability below is conditional, never guaranteed.

Status: audit only for the features below, except for the model catalog, the picker, and TaskView.
Repo checked: `johngraven75/Cina-Claw-Pro`, main `a6ad036`, v1.0.5, Electron + React 19 + embedded OpenClaw 2026.7.1.
Delivered in this branch: `shared/free-models/catalog.json` (30 models, validated by `tests/free-model-catalog.test.mjs`); the free-model picker on the Models page (see step 1); and a Manus-style TaskView on the Chat page — a toolbar toggle that opens a task header (title, Working/Idle status, file-change count) beside a split panel with a new Steps tab (live plan entries, tool calls, and approvals from the ACP timeline), plus the existing Workspace/Preview/Changes tabs, with a resizable divider.
Not yet delivered: a Hugging Face provider, sandboxed execution, a separate terminal tab (terminal output appears as tool calls, not a console), live agent-browser viewport control, and every other item below. Do not claim those as done.

## What is already present (code-wired, not just labelled)

- Chat with multimodal attachments, file read/write/edit with Monaco diff preview, artifact panel
- Agents (name, per-agent model override, channel binding), multi-agent delegation seeded in defaults
- Real cron (time schedules, channel delivery, run history) — the engine for Tasks-style work
- Channels: Telegram, Discord, WhatsApp, WeChat, Feishu, DingTalk, QQ, WeCom, Lark, plus remote-relay pairing
- Windows voice via System.Speech, 10 profiles
- Workspace browser, session transcripts, token-usage history from transcripts
- Bundled agent-browser binary, local-HTML preview browser

## What is partial, and why it is not parity yet

| Area | Gap |
|---|---|
| Coding / Codex | Host-gateway execution, no sandbox; no terminal pane; no git/PR/CI/test loop in the UI; no verification loop (run tests, fix, re-verify, only then mark done) |
| Autonomous delivery / Manus | Plan items render, but there is no task graph, checkable steps with pass/fail, retry policy, or deliverable gate |
| Tasks | Cron exists, but no natural-language task creation from chat, no webhook/email/event triggers, no multi-step workflows, retries, or templates |
| Projects / Custom GPTs / Gems | No such surface. Agents are name + model only; no custom-instructions editor, knowledge files, or tool toggles. Global guidance is one file |
| Deep research | `web_search` is deliberately denied in defaults; browsing is fetch/navigate only, with no research planner, source list, or citations UI |
| Reasoning | Thought blocks render only when the model streams them; no effort control, thinking on/off, or reasoning-token display |
| Image generation | Settings-only page, dev-mode-gated in release builds; no edit/inpaint canvas |
| Canvas / artifacts | Static file previews, no live interactive app canvas with edit-and-rerun, versions, or export |
| Computer use | Agent-browser binary is bundled, but there is no user-visible viewport, action log, or take-over console |
| Skills | README says 57 bundled skills; the preinstalled manifest actually lists 102. Many Codex/Manus entries are prompt adapters: they do not install runtimes, start services, connect accounts, or grant machine access. The Skills UI should label adapters vs native integrations and check dependencies before presenting a skill as working |
| Models | Only 3 free presets are surfaced today (OpenRouter Ox Alpha, OpenRouter Free router, Gemini Flash, plus Ollama Qwen3-VL:8b). Model IDs are otherwise typed manually; there is no catalogue, search, or capability/context/price filter |

## Prioritised build order

0. **First-boot key entry, retained — DONE in this branch** — `src/components/setup/FirstBootKeyEntry.tsx` on the setup wizard's Provider step: a single OpenRouter key field (password input, Save, saved/replace status) above the full provider settings. Saving goes through the provider store into the main-process secret store (OS secure storage), never localStorage and never rendered back; on every later boot the app reloads the provider snapshot, so the key is retained without re-entering. If no OpenRouter account exists it creates one enabled account with model `stealth/ox-alpha` and makes it default when nothing is default yet; if one exists it only enables it and replaces the key, leaving any custom model alone. Full en/zh/ja/ru text in `shared/i18n/locales/*/setup.json` (`provider.firstBootKey`), unit test `tests/unit/first-boot-key-entry.test.ts` 3/3 passing, web typecheck clean for the new files (one pre-existing error remains in `RemoteRelaySettings.tsx`, untouched here).
0b. **Persona spaces (Soul / Memory / System Prompt) — DONE in this branch** — `src/pages/Persona/index.tsx` at route `/persona` (sidebar "Persona"): three tabbed editors for the main agent's workspace files — Soul (`SOUL.md`), Memory (`MEMORY.md`), System Prompt (`AGENTS.md`, labelled System Prompt because that is what it functions as; its on-disk name is unchanged so OpenClaw keeps loading it). Files are read by OpenClaw in new sessions, so edits take effect for new sessions, not running ones. Saving uses the files service, with a new guarded `createText` method (sandbox-checked, refuses to overwrite, never creates parent directories) for files that do not exist yet, because `writeText` deliberately never creates files. Full en/zh/ja/ru text in a new `persona` i18n namespace, unit tests for the page (3/3) and for `createText` (1/1, including outside-sandbox refusal), node typecheck clean, web typecheck clean for the new files.
1. **Wire the catalog into the picker — DONE in this branch, with one limit** — `src/components/models/FreeModelCatalog.tsx` on the Models page is a real picker over `shared/free-models/catalog.json`: tier filters, search, uncensored opt-in toggle (off by default, local-only, never defaults), and full en/zh/ja/ru UI text in `shared/i18n/locales/*/dashboard.json`. OpenRouter and Ollama rows apply to an existing enabled provider account (and set it as default); Hugging Face / vLLM / llama.cpp rows are setup-only and show their exact HF ID and setup note. Ox Alpha is featured above the catalog as an OpenRouter pick, not counted in the 30 Hugging Face models. The picker harness is styled in a Manus-inspired minimal way — flat thin-bordered cards, a rounded prompt-style search, and a segmented tier control — while keeping the app's existing surface tokens; a full Manus split-screen TaskView (chat left, live browser/terminal/files right) is not built here. Still missing from this step: live verification of any `:free` ID at startup with fallback to local — the picker still shows the catalog's verify-live warning instead of probing OpenRouter itself.
2. **Sandboxed execution** — scoped workspace sandbox with filesystem/network policy before any Codex-parity claim. Host execution for untrusted code is unsafe.
3. **Verification loop UI** — run tests/lint/typecheck from chat, show pass/fail per step, retry with the failure log.
4. **Git/PR workflow UI** — branch, commit, diff-review, push, PR create/status, reusing the Monaco diff viewer.
5. **Deep-research mode** — opt-in `web_search` + multi-query planner + citations, keeping deny-by-default for normal chat.
6. **Projects / Custom Agents v2** — instructions editor, knowledge files, per-agent tool toggles, export.
7. **Real task graph** — plan items become checkable steps with status, logs, and approval gates.
8. **Scheduled-task upgrade** — create from chat in natural language, webhook/event triggers, multi-step bodies, retry policy, templates.
9. **Image edit canvas** — remove the dev-mode gate, add prompt + reference-image edit/inpaint.
10. **Live artifact canvas, computer-use console, reasoning controls, model capability probing, memory manager** — in that order, reusing the existing artifact panel, agent-browser binary, and transcript-based usage history.

## Honest wording for "no config needed"

- "No config" is true only for: (a) a cloud-instant row with a free OpenRouter key already present, or (b) a one-pull row after Ollama is installed once.
- It is NOT true for gated models (Gemma, Llama — HF account + terms acceptance), power-user models (weight download + GPU), or any `:free` ID that has churned off OpenRouter's list. The catalog records `setupNeeded` per row so the UI can say exactly that, instead of promising instant use and failing at runtime.
- "Free" means no model-licence fee. It does not mean free compute, and OpenRouter free tiers are rate-limited.
