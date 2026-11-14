# Cina-Claw Pro v1.0.10

## Release summary

Cina-Claw Pro v1.0.10 fixes the three stale Electron E2E test expectations on
main (PR #36) so CI is green on all platforms. There are no application
changes in this release — the app itself is identical to v1.0.9. It builds on
v1.0.9 (automatic listing of downloaded Ollama models in the chat picker);
nothing from v1.0.9 is removed.

## Included changes

### Fix 3 stale Electron E2E test expectations (PR #36)

- `tests/e2e/app-smoke.spec.ts` — the `z-ai/glm-5.3-flash` name now appears
  twice by design (featured successor card plus catalog row, PR #30); the
  assertion is scoped to the featured successor card.
- `tests/e2e/free-model-catalog.spec.ts` — uncensored catalog rows are ranks
  31–50 in catalog v2 (50 models), not 21–30; the test now expects the
  correct ranks.
- `tests/e2e/image-generation-settings.spec.ts` — the image-generation sidebar
  link was deliberately un-gated in PR #28; the test now expects it visible.

## Validation

Electron E2E run 43524803941 green on all three platforms (ubuntu, windows,
macos), plus all other PR checks green (SonarCloud, CodeQL, verify, build,
repository-integrity). The release workflow's own verify-source +
package-windows steps are the Windows packaging evidence for this release.

Windows installers are unsigned unless the repository is supplied with a
trusted Windows signing identity. Windows SmartScreen may display a warning
for unsigned artifacts.

## Known limitations (honest, at release preparation time)

- A live installed-Windows run of this build (new chat, "hi" test with a
  configured or auto-added model) has not yet been observed on real Windows.
  Do not treat chat as live-Windows-verified until that run returns a reply.
- The in-app Ollama start and model-pull actions remain allowlisted to the
  pre-attached Qwen3-VL builds only; other models must still be pulled with
  `ollama pull` (or Ollama's own UI) before they appear.
