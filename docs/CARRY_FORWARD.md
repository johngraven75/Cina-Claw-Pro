# Cina-Claw Pro — Master Carry-Forward Registry

No accepted capability may be removed or hidden without explicit owner approval and a documented release-note entry. CI verifies this registry on every push, pull request, and release.

## v1.0.0 Windows foundation

| Capability | Token | Source |
| --- | --- | --- |
| Windows product identity | `productName: Cina-Claw Pro` | `electron-builder.yml` |
| Stable Windows release filenames | `artifactName: Cina-Claw-Pro-${version}-${os}-${arch}.${ext}` | `electron-builder.yml` |
| Embedded OpenClaw runtime | `"openclaw": "2026.7.1"` | `package.json` |
| Animated command center | `export function CinaCommandCenter` | `src/pages/Chat/CinaCommandCenter.tsx` |
| 3D neural core | `.cina-core-card` | `src/styles/globals.css` |
| Multimodal input | `composer.attachFiles` | `src/pages/Chat/ChatInput.tsx` |
| OpenRouter free router | `openrouter/free` | `src/lib/providers.ts` |
| Gemini free-tier preset | `gemini-3-flash-preview` | `src/lib/providers.ts` |
| Startup-ready local Ollama preset | `qwen3-vl:8b` | `electron/utils/cina-claw-defaults.ts` |
| Guarded planning and delegation | `applyCinaClawAutonomyDefaults` | `electron/utils/cina-claw-defaults.ts` |
| OS-backed secret encryption | `safeStorage.encryptString` | `electron/services/secrets/secret-store.ts` |
| Official skill bundle | `webapp-testing` | `resources/skills/preinstalled-manifest.json` |
| Reviewed curated skill bundle | `cina-curated-2026.08.13` | `resources/skills/preinstalled-manifest.json` |
| Official Google agent-skill catalog | `google-agent-skills-catalog` | `resources/skills/preinstalled-manifest.json` |
| VoltAgent awesome agent-skill catalog | `voltagent-awesome-agent-skills-catalog` | `resources/skills/preinstalled-manifest.json` |
| Multi-agent management | `export function Agents` | `src/pages/Agents/index.tsx` |
| Scheduled automations | `export function Cron` | `src/pages/Cron/index.tsx` |
| Four-locale UI | `"commandCenter"` | `shared/i18n/locales/en/chat.json` |
| Ten-profile voice catalog (5 female / 5 male) | `export const VOICE_PROFILES` | `shared/voice.ts` |
| Windows-native voice bridge | `export function createVoiceApi` | `electron/services/voice-api.ts` |
| All-model truth, evidence, and privacy guidance | `## Default Model Behavior` | `resources/context/AGENTS.clawx.md` |
| Carry-forward CI | `verify:carry-forward` | `package.json` |

Provider quotas, model inventories, and external plugin APIs may change independently. Community code is not silently granted machine access.
