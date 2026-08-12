# Cina-Claw Pro v1.0.3

## Purpose

This corrective release restores automatic OpenClaw gateway startup and connection in the installed Windows application after the v1.0.2 desktop-runtime update.

## Reliability improvements

- Restores the last gateway-verified Electron utility-process runtime and WebSocket client versions.
- Migrates the invalid v1.0.2 autonomy field aliases to the strict OpenClaw 2026.7.1 schema before gateway startup.
- Adds an installed-executable Windows smoke test, running under a clean valid Windows profile, that starts the real bundled OpenClaw gateway and requires a successful gateway handshake before release publication.
- Emits application and gateway log tails when the packaged smoke test fails, making future startup regressions actionable in CI.
- Preserves all v1.0.2 settings, providers, models, voice, skills, channels, and local data.

## Verification requirements

- Gateway runtime compatibility and process-launcher unit tests pass.
- Communication replay and regression comparison pass.
- Full source verification, carry-forward checks, and harness validation pass.
- The packaged Windows executable emits a successful `gateway.startup` metric before its installer can be published.

## Known limitations

- This community build remains unsigned unless the repository is supplied with a trusted Windows signing identity, so Windows SmartScreen may display a warning.
- Hosted-provider availability, quotas, and model capabilities remain controlled by their respective providers.
