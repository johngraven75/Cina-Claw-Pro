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

## Validation expectations

The release must pass the reusable OpenRouter Free reasoning audit, manifest and managed-skill validation, type checking, linting, unit and integration tests, carry-forward verification, production Vite build, Electron E2E on Linux/macOS/Windows, Windows packaging, checksum generation, and release artifact inventory.

Windows installers are unsigned unless the repository is supplied with a trusted Windows signing identity. Windows SmartScreen may display a warning for unsigned artifacts.
