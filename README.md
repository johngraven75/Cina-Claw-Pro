# Cina-Claw Pro

Cina-Claw Pro is a Windows-first autonomous multimodal AI command center powered by the embedded [OpenClaw](https://github.com/openclaw/openclaw) runtime. It combines chat, images and files, multi-agent delegation, skills, browser tools, channels, and scheduled automations in an animated desktop interface.

## Voice chat

Voice chat uses Windows-native `System.Speech`, so dictation and playback do not require a paid speech provider. The composer accepts microphone prompts, assistant replies can be read automatically, and Settings includes ten tuned profiles—five female and five male—with speed, depth, auto-read, and auto-send controls. Microphone capture starts only when the user presses the mic button.

## Free-first models

- **Local Ollama default** — fresh installations default to the local Ollama model `qwen3-vl:8b-instruct` (Qwen3-VL 8B Instruct), with `qwen3-vl:4b-instruct` and `qwen3-vl:2b-instruct` as lower-VRAM fallbacks. No API key is needed, but Ollama must be running and the model pulled once; Chat shows Ollama-down / needs-pull status with a Recheck action instead of claiming readiness. The retired OpenRouter `stealth/ox-alpha` default (404) is never seeded again.
- **OpenRouter successor** — newly configured OpenRouter accounts default to `z-ai/glm-5.3-flash`, which is metered, not a free preview. It is used only when the operator adds an OpenRouter API key; Cina-Claw Pro never switches to a paid model automatically.
- **OpenRouter Free Router** — `openrouter/free` remains available as an explicit operator-selected route that dynamically chooses a no-cost model. Availability and supported modalities vary.
- **Google Gemini Flash** — `gemini-3-flash-preview` uses Gemini API free-tier quotas when the account is eligible.
- **Ollama Local** — `qwen3-vl:8b-instruct` is the default local model (with `qwen3-vl:8b` also recognised) for reasoning, image input, and tool-driven general assistance with no hosted token charge. Install [Ollama](https://ollama.com/) separately, start it, and run `ollama pull qwen3-vl:8b-instruct`. Cina-Claw Pro never silently falls back to a cloud provider.
- **Free model catalog (Models page)** — 50 free, open, multimodal reasoning models in `shared/free-models/catalog.json`: 30 standard plus 20 uncensored, grouped as cloud-instant, one-pull, power-user, and not-a-default. All catalog models are pre-attached to their providers, so Chat opens with the Ollama default already selected instead of a blank picker. OpenRouter and Ollama rows can be applied to an existing enabled provider account from the picker; Hugging Face / vLLM / llama.cpp rows are setup-only and show their exact model ID and setup note instead of claiming selection. The 20 uncensored models are hidden until an explicit per-session opt-in is turned on, are local-only, and are never defaults. New rows carry a verification level (strong, strong-existence-only, or snippet-only); snippet-only rows are NOT verified as working. External free-tier availability is conditional and may change. The Chat page also has a Manus-style TaskView: a toolbar toggle opens a task header beside a split panel with Steps (live plan entries, tool calls, and approvals), Workspace, Preview, and Changes tabs. Persona page: editable Soul (SOUL.md), Memory (MEMORY.md), and System Prompt (AGENTS.md) spaces for the main agent's workspace files, saved through the files service (create when missing, never overwrite on create) and read by OpenClaw in new sessions.
- **Chat switches (per session, beside the model picker)** — Reasoning (with effort Low/High/Max as a prompt instruction, not a provider parameter), Skills, Files / Workspace, Tools / Code execution, Memory, Use Browser, Web Search, Deep Research, Image Generation, Voice / Multimodal input, Show uncensored models, and Autonomy (Off / Supervised / Full Autonomy). Switches send a session instruction with each prompt and gate composer input; they do not change global runtime configuration. Wired: skills (token stripping), files (attachment dropping), code execution (off auto-declines; on keeps the allowlist and ask-on-miss approvals), browser (fetch/navigate plus an activity list of pages actually touched), uncensored filtering (explicit account flag, name markers as fallback). Scoped, not full: web search is a session-scoped instruction but `web_search` remains denied in the global runtime config, so search steps fall back to `web_fetch` of explicit URLs and say so; deep research inherits that limit and must list only sources actually fetched. Unavailable, not claimed: there is NO live browser viewport (no clicking or typing into pages, no live preview), scoped execution is NOT full sandboxing, and there is no in-app Ollama start or model-pull action yet — only status plus Recheck.
- **Full Autonomy (bounded)** — Full Autonomy continues multi-step tasks unattended with a full activity log and Stop control, but never crosses hard boundaries: no deleting files outside the workspace scope, no rewriting history, no committing or exposing secrets, no bypassing or defeating approvals, sign-ins, or deletion protections, no sending messages, emails, or payments and no publishing or releasing without explicit approval, and no scope expansion. Dangerous actions pause for approval; genuine blockers stop the task instead of being worked around.

- **Cina harness layer (draft)** — Chat, the switches, and TaskView talk to Cina-Claw's own harness core, which owns session orchestration, provider/model routing (the pre-attached catalog defaults, dead models refused), switch state, tool routing, the approval queue, and a timestamped, metadata-only activity log. The engine underneath is an adapter: the initial default is the existing OpenClaw gateway/ACP engine, which still provides sessions, channels, cron, skills execution, and the plugin runtime — the harness does not replace it. A Direct engine (OpenAI-compatible Ollama/OpenRouter chat) is defined but stubbed in this draft: it is not available yet because no host route for OpenAI-compatible chat exists and the renderer must not fetch Ollama or the gateway directly, so it never fakes a reply and never silently substitutes for OpenClaw. A future engine swap only adds an adapter; the UI, switches, and catalog do not change.

Provider credentials are encrypted with Electron `safeStorage` using the operating system's protected credential storage. The setup wizard requires one enabled provider so chat works immediately after onboarding. Existing and upgraded provider or model choices are never replaced by the Ollama first-boot default.

Local speech never needs a speech host. Chat prompts sent to a hosted AI model are still processed under that provider's privacy terms; use Ollama for local model inference and never paste passwords, private keys, tokens, or recovery codes into a prompt.

## Autonomy and skills

Planning, bounded code-mode execution, and multi-agent delegation are enabled on first launch. Host commands use an allowlist and require approval on a miss. Explicit operator settings are always preserved.

Managed all-model guidance requires truthful, relevant, evidence-based responses, minimal assumptions, private handling of user content, and maximal completion of lawful and safe requests. Provider/system requirements still apply. Secrets should be entered through secure Settings, not pasted into chat.

Fifty-seven reviewed skills are bundled and enabled: 17 skills from the official Anthropic repository plus 40 provenance-preserving Cina adapters for the requested research, engineering, browser, design, gateway, Google, VoltAgent, agent, media, and workflow ecosystems. The adapters do not silently install external runtimes, start services, connect accounts, or grant machine access. OpenClaw's plugin/provider discovery and the broader skills marketplace remain available for explicit installs.

## Desktop development

Requirements: Node.js 24, Corepack, pnpm 10.33.4, and Git. The shared default-model configuration is packaged for Windows, macOS, and Linux.

```powershell
corepack enable
pnpm run init
pnpm dev
```

Release verification and packaging:

```powershell
pnpm run verify:release
pnpm run package:win
```

Tagged releases are built on `windows-latest`, published with update metadata, and accompanied by `SHA256SUMS.txt`. Builds remain unsigned until a Windows code-signing identity is configured; Windows may show a SmartScreen warning.

## Repository policy

Accepted capabilities are protected by [docs/CARRY_FORWARD.md](docs/CARRY_FORWARD.md), the CI carry-forward test, and [.github/AUTOMATION_POLICY.md](.github/AUTOMATION_POLICY.md). Provider free tiers and external model inventories can change independently of the app.

## License and attribution

Cina-Claw Pro is a derivative of the MIT-licensed [ClawX](https://github.com/ValueCell-ai/ClawX) project and embeds the separately maintained OpenClaw runtime. See [NOTICE.md](NOTICE.md) and [LICENSE](LICENSE).
