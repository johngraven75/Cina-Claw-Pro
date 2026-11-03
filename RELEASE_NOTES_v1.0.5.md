# Cina-Claw Pro v1.0.5

## Release summary

Cina-Claw Pro v1.0.5 makes OpenRouter Free the safe first-boot routing default and expands the managed skill catalog with verified, provider-agnostic reasoning and workflow adapters.

## Included changes

- New installations seed `openrouter/free` through the secure OpenRouter provider configuration without changing existing operator model, provider, credential, header, or concurrency choices.
- Free-router primary-agent and subagent concurrency use conservative defaults when unset, with capability-aware fallback behavior for tool calls, vision, files, structured output, and rate-limited work.
- Reasoning, planning, reflection, critique, research synthesis, and multi-agent workflows use staged prompts, explicit intermediate artifacts, bounded delegation, and deterministic verification where practical.
- The managed catalog includes 44 original CinaClaw adapters for official OpenAI Codex and ChatGPT skill concepts. The adapters are auto-enabled only when application-managed and do not copy upstream instructions, scripts, or assets.
- The first-boot experience explains the OpenRouter Free requirement in English, Japanese, Russian, and Chinese and states that Cina-Claw Pro does not automatically switch to a paid model.
- The packaged runtime compatibility assertion now matches the current Electron 41.10.3 and WebSocket 8.21.0 release line.
- Release validation rerun includes the corrected empty-query guard for the Google Agent Skills catalog search.
- Free model catalog (Models page): 30 free, open, multimodal reasoning models, grouped as cloud-instant, one-pull, power-user, and not-a-default. OpenRouter and Ollama rows apply to an existing enabled provider account; Hugging Face / vLLM / llama.cpp rows are setup-only. Ten uncensored models are hidden until an explicit opt-in toggle, are local-only, and are never defaults. OpenRouter Ox Alpha (`stealth/ox-alpha`) is featured at the top of the picker and is not counted in the 30 Hugging Face models. External free-tier availability is conditional and may change.
- Manus-style TaskView (Chat page): a toolbar toggle opens a task header (Working/Idle, file-change count) beside the split panel, with a new Steps tab listing live plan entries, tool calls, and approvals.
- First-boot key entry: the setup wizard Provider step has a single OpenRouter key field that is retained through the operating system's secure provider store (never localStorage, never rendered back), creating an Ox Alpha default account only when none exists.
- Persona page: editable Soul (`SOUL.md`), Memory (`MEMORY.md`), and System Prompt (`AGENTS.md`) spaces for the main agent's workspace files. Edits take effect for new sessions. Saving uses the files service, with a guarded create path for files that do not exist yet.
- Fixed the Remote Relay settings revoke call so it passes the device id in the form the host client expects; this was the last web typecheck error blocking the release gate.

## Validation expectations

The release must pass the reusable OpenRouter Free reasoning audit, manifest and managed-skill validation, type checking, linting, unit and integration tests, carry-forward verification, production Vite build, Electron E2E on Linux/macOS/Windows, Windows packaging, checksum generation, and release artifact inventory.

Windows installers are unsigned unless the repository is supplied with a trusted Windows signing identity. Windows SmartScreen may display a warning for unsigned artifacts.
