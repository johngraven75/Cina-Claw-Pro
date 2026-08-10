---
id: windows-native-voice-safety
title: Windows Native Voice Safety
type: ai-coding-rule
appliesTo:
  - gateway-backend-communication
requiredProfiles:
  - fast
  - comms
---

Voice capture is explicit and foreground-only. The application must never start
the microphone on launch, in the background, or merely because automatic reply
playback is enabled. A listening operation must expose visible state and an
immediate cancel action.

Renderer voice calls go through the typed Host API. Only Electron Main may
start Windows speech processes. User text must be transported as encoded data,
not concatenated into PowerShell source, command arguments, or shell strings.

Windows-native `System.Speech` is the default speech route. Do not add a remote
speech host, upload microphone audio, or require a paid speech credential
without explicit owner approval and matching privacy documentation.

Voice profile catalogs must retain exactly five female and five male choices.
The UI may tune an installed Windows voice by gender, pitch, rate, and depth;
when the requested system gender is not installed it must fail gracefully or
use the current Windows voice without claiming a missing OS voice was bundled.

Automatic assistant playback runs only after a completed response. It must not
read raw URLs, Markdown punctuation, fenced code, secrets, tool traces, or
historical replies loaded merely by switching sessions.
