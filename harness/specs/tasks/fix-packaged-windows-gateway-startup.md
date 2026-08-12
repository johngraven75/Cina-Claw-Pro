---
id: fix-packaged-windows-gateway-startup
title: Fix packaged Windows gateway startup regression
scenario: gateway-backend-communication
taskType: runtime-bridge
intent: Restore reliable bundled OpenClaw gateway startup and connection in the installed Windows application after the v1.0.2 runtime dependency update.
touchedAreas:
  - harness/specs/tasks/fix-packaged-windows-gateway-startup.md
  - package.json
  - pnpm-lock.yaml
  - scripts/smoke-packaged-gateway.mjs
  - .github/workflows/win-build-test.yml
  - .github/workflows/release.yml
  - tests/unit/gateway-runtime-compatibility.test.ts
  - tests/unit/cina-claw-defaults.test.ts
  - RELEASE_NOTES_v1.0.3.md
expectedUserBehavior:
  - A clean Windows installation starts the bundled OpenClaw gateway automatically.
  - The desktop app completes the authenticated gateway WebSocket handshake on port 18789.
  - A gateway startup failure stops the Windows packaging workflow before an installer is published.
requiredProfiles:
  - fast
  - comms
requiredTests:
  - tests/unit/gateway-runtime-compatibility.test.ts
  - tests/unit/gateway-process-launcher.test.ts
acceptance:
  - Runtime-critical Electron and WebSocket versions match the last gateway-verified release line.
  - The packaged Windows executable is launched after packaging and emits a successful gateway.startup metric.
  - The packaged smoke test prints application and gateway diagnostics when readiness times out.
  - The smoke test always terminates the application-owned process tree and does not leave port 18789 occupied.
  - Comms replay and compare pass.
docs:
  required: true
---

Repair the v1.0.2 packaged Windows gateway regression and close the validation gap that allowed mocked renderer lifecycle tests to pass without launching the bundled OpenClaw runtime.
