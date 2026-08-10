# Cina-Claw Pro

Cina-Claw Pro is a Windows-first autonomous multimodal AI command center powered by the embedded [OpenClaw](https://github.com/openclaw/openclaw) runtime. It combines chat, images and files, multi-agent delegation, skills, browser tools, channels, and scheduled automations in an animated desktop interface.

## Free-first models

- **OpenRouter Free Router** — `openrouter/free` dynamically selects an available no-cost model. Availability and supported modalities vary.
- **Google Gemini Flash** — `gemini-3-flash-preview` uses Gemini API free-tier quotas when the account is eligible.
- **Ollama Local** — `gemma4:latest` keeps inference on the Windows PC with no hosted token charge.

Provider credentials are encrypted with Electron `safeStorage` (Windows DPAPI in packaged Windows builds). The setup wizard requires one enabled provider so chat works immediately after onboarding.

## Autonomy and skills

Planning, bounded code-mode execution, and multi-agent delegation are enabled on first launch. Host commands use an allowlist and require approval on a miss. Explicit operator settings are always preserved.

Seventeen reviewed skills from the official Anthropic skills repository are bundled and enabled. OpenClaw's plugin/provider discovery and the broader skills marketplace remain available, but community code is never silently granted machine access.

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
