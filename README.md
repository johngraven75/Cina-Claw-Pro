# Cina-Claw Pro

Cina-Claw Pro is a Windows-first autonomous multimodal AI command center powered by the embedded [OpenClaw](https://github.com/openclaw/openclaw) runtime. It combines chat, images and files, multi-agent delegation, skills, browser tools, channels, and scheduled automations in an animated desktop interface.

## Voice chat

Voice chat uses Windows-native `System.Speech`, so dictation and playback do not require a paid speech provider. The composer accepts microphone prompts, assistant replies can be read automatically, and Settings includes ten tuned profiles—five female and five male—with speed, depth, auto-read, and auto-send controls. Microphone capture starts only when the user presses the mic button.

## Free-first models

- **OpenRouter Free Router** — `openrouter/free` dynamically selects an available no-cost model. Availability and supported modalities vary.
- **Google Gemini Flash** — `gemini-3-flash-preview` uses Gemini API free-tier quotas when the account is eligible.
- **Ollama Local** — fresh installs select `qwen3-vl:8b` for local reasoning, image input, and tool-driven general assistance with no hosted token charge. Install [Ollama](https://ollama.com/) separately, start it, and run `ollama pull qwen3-vl:8b`. Cina-Claw Pro never silently falls back to a cloud provider.

Provider credentials are encrypted with Electron `safeStorage` (Windows DPAPI in packaged Windows builds). The setup wizard requires one enabled provider so chat works immediately after onboarding.

Local speech never needs a speech host. Chat prompts sent to a hosted AI model are still processed under that provider's privacy terms; use Ollama for local model inference and never paste passwords, private keys, tokens, or recovery codes into a prompt.

## Autonomy and skills

Planning, bounded code-mode execution, and multi-agent delegation are enabled on first launch. Host commands use an allowlist and require approval on a miss. Explicit operator settings are always preserved.

Managed all-model guidance requires truthful, relevant, evidence-based responses, minimal assumptions, private handling of user content, and maximal completion of lawful and safe requests. Provider/system requirements still apply. Secrets should be entered through secure Settings, not pasted into chat.

Fifty-five reviewed skills are bundled and enabled: 17 skills from the official Anthropic repository plus 38 provenance-preserving Cina adapters for the requested research, engineering, browser, design, gateway, agent, media, and workflow ecosystems. The adapters do not silently install external runtimes, start services, connect accounts, or grant machine access. OpenClaw's plugin/provider discovery and the broader skills marketplace remain available for explicit installs.

## Windows development

Requirements: Node.js 24, Corepack, pnpm 10.33.4, Git, and Windows 10/11.

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
