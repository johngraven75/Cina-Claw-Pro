---
id: windows-native-voice-chat
title: Windows-native voice chat and global model behavior defaults
scenario: gateway-backend-communication
taskType: runtime-bridge
intent: Add private Windows speech recognition and synthesis with ten curated voice profiles, spoken assistant replies, composer dictation, and durable evidence/privacy-first model guidance.
touchedAreas:
  - harness/specs/tasks/windows-native-voice-chat.md
  - harness/specs/rules/windows-native-voice-safety.md
  - harness/specs/scenarios/gateway-backend-communication.md
  - shared/voice.ts
  - shared/host-api/contract.ts
  - electron/services/voice-api.ts
  - electron/main/ipc-handlers.ts
  - electron/utils/store.ts
  - resources/context/AGENTS.clawx.md
  - README.md
  - README.zh-CN.md
  - README.ja-JP.md
  - README.ru-RU.md
  - RELEASE_NOTES_v1.0.0.md
  - docs/CARRY_FORWARD.md
  - src/lib/host-api.ts
  - src/stores/settings.ts
  - src/components/settings/VoiceSettings.tsx
  - src/pages/Settings/index.tsx
  - src/pages/Chat/ChatInput.tsx
  - src/pages/Chat/index.tsx
  - src/styles/globals.css
  - shared/i18n/locales/*/settings.json
  - shared/i18n/locales/*/chat.json
  - tests/unit/voice-profiles.test.ts
  - tests/unit/voice-api.test.ts
  - tests/unit/chat-input.test.tsx
  - tests/carry-forward-verification.test.mjs
  - tests/e2e/voice-chat.spec.ts
expectedUserBehavior:
  - Voice Chat settings show exactly five female and five male profiles with speed, depth, automatic spoken replies, and automatic dictation-send controls.
  - The chat composer can capture a spoken prompt through the Windows default microphone and either insert or send the transcript.
  - Completed assistant responses can be read aloud with the selected profile through Windows speech APIs; no paid speech host is required.
  - All model workspaces receive concise truthfulness, evidence, minimal-assumption, confidentiality, and maximally-helpful safe-completion guidance without overriding provider-mandated policy.
requiredProfiles:
  - fast
  - comms
requiredRules:
  - backend-communication-boundary
  - renderer-main-boundary
  - api-client-transport-policy
  - docs-sync
  - ui-i18n-design-tokens
  - windows-native-voice-safety
requiredTests:
  - tests/unit/voice-profiles.test.ts
  - tests/unit/voice-api.test.ts
  - tests/e2e/voice-chat.spec.ts
  - pnpm run typecheck
  - pnpm run lint:check
  - pnpm run comms:replay
  - pnpm run comms:compare
acceptance:
  - Renderer voice operations use typed hostApi routes only; pages do not spawn processes or invoke raw IPC.
  - PowerShell receives text through encoded environment data and never shell-interpolates user content.
  - Microphone capture starts only after an explicit user action and can be cancelled.
  - Voice profile tests enforce exactly ten choices with a five/five gender split and a valid default.
  - E2E covers opening Voice Chat settings, choosing a profile, and finding the composer microphone control.
  - Hosted-provider limitations and confidential-data boundaries are documented accurately.
docs:
  required: true
---

## Scope

Use Windows `System.Speech` for speech recognition and synthesis so the feature
works without another hosted account. Keep actionable UI elements stable while
decorative 3D layers animate. Persist voice preferences through the existing
settings store and propagate Cina-Claw behavior guidance through the managed
workspace `AGENTS.md` context section.

## Out of scope

- Sending credentials or private data to speech services.
- Background microphone activation.
- Bypassing model-provider safety or legal restrictions.
- Claiming that a remote model host cannot process prompts sent to it.
