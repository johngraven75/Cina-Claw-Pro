# Cina-Claw Pro v1.0.6

## Release summary

Cina-Claw Pro v1.0.6 adds a real media-download feature to the Windows app and cleans up two labeling and wiring issues found in review. It builds on v1.0.5 (free-model catalog, Manus TaskView, first-boot key entry, Persona spaces); no catalog v2 features are included in this release.

## Included changes

- New Downloads page: URL input, output folder, job list, progress, error and refusal surfacing, cancel, and show-in-folder, wired through the typed host API to a new media-download service.
- Media download, bundled not PATH-only: `.m3u8` streams download through a bundled ffmpeg (best-variant selection, key handling, and segment assembly all done by ffmpeg, never hand-rolled); other internet video downloads through a bundled yt-dlp (`--no-playlist`, single video only). Packaged builds require the bundled tools; a missing bundled copy is a hard error.
- Download refusals: credential URLs are refused pre-flight, and DRM-protected, login-gated, paywall-gated, age-verification, and CAPTCHA signals in tool output become a `refused` job with a plain message. No credentials, cookies, or CAPTCHA answers are ever passed to ffmpeg or yt-dlp. Win arm64 is uncovered (no gyan.dev essentials build for it).
- Image generation un-hidden: the `/image-generation` route and sidebar item are no longer dev-mode-gated, so release users can reach the already-coded page; its settings surface is consistent with the page.
- README skill count corrected: the manifest lists 102 bundled skills (17 Anthropic + 85 adapters), not 57/40, corrected in all four READMEs.
- Stale import fixed: `src/types/electron.d.ts` now imports from `@shared/host-api/types` instead of the deleted `host-api-types` path.

## Validation expectations

The release must pass type checking, linting, unit and integration tests, production Vite build, Electron E2E, Windows packaging, checksum generation, and release artifact inventory.

Windows installers are unsigned unless the repository is supplied with a trusted Windows signing identity. Windows SmartScreen may display a warning for unsigned artifacts.

## Known limitations (honest, at release preparation time)

- GitHub Actions CI runs for the check, Windows build-test, and Electron E2E workflows did not fire on this pull request's head in earlier verification, so CI Windows-job evidence and a live installed-Windows download run remain unproven at the time these notes were prepared. Do not treat this release as CI-verified on Windows until a release workflow run for v1.0.6 is observed green.
