# Unreleased

## Media downloads (new)

- New Downloads page: downloads clear, public video — HLS playlists (`.m3u8`) via ffmpeg and site video via yt-dlp — using ffmpeg and yt-dlp bundled into the Windows installer by `prep:win-binaries`.
- DRM-protected streams, login/paywall-gated content, and CAPTCHA-gated downloads are refused; the app never supplies credentials, cookies, or CAPTCHA answers to a download tool.
- Image generation is no longer dev-mode-gated: the sidebar entry and page are available in release builds.
- Bundled skill count corrected in all READMEs: 102 reviewed skills (17 Anthropic + 85 Cina adapters), matching `resources/skills/preinstalled-manifest.json`.

## Signing status (unchanged — still unsigned)

- Windows installers remain **unsigned**: no code-signing identity has been configured, `verifyUpdateCodeSignature` stays `false`, and Windows may show a SmartScreen warning. Signing would require a Windows code-signing certificate (e.g. an EV certificate or a trusted signing service account) plus the corresponding electron-builder `certificateFile`/`certificatePassword` (or Azure Trusted Signing) configuration — none of which is created or committed here.

## OpenRouter Ox Alpha default

- Fresh configurations and newly configured OpenRouter accounts now select `stealth/ox-alpha` (Ox Alpha) through the existing OpenClaw architecture on Windows, macOS, and Linux.
- Seeded metadata records reasoning, text and image input, a 1,048,576-token context window, and a 131,072-token output limit.
- The legacy `openrouter/free` route remains supported as an explicit operator choice.
- Existing and upgraded provider/model settings, fallbacks, credentials, headers, and concurrency choices remain unchanged. The first-boot seed runs only when both the model-provider section and default-agent model are absent.
- The cloud fallback list remains intentionally empty; Cina-Claw Pro does not silently switch to a paid model.

## External prerequisite and limitation

An OpenRouter API key is required and is stored through the operating system's protected credential storage. Ox Alpha is an externally operated stealth preview that is currently listed as free. Availability, pricing, quotas, capabilities, identity, retention terms, and other provider conditions can change independently of Cina-Claw Pro.
