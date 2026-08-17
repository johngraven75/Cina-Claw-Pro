# Cina-Claw-Pro v1.0.4 Carry-Forward Report

## Scope

This report carries forward the v1.0.4 release state and records the remediation completed after the previous release-gate investigation.

## Completed in this iteration

The Vite launcher now invokes `vite build` for build jobs instead of starting an unbounded development server. CI/E2E builds also suppress the `vite-plugin-electron` main-process startup callback, preventing an orphan Electron application and embedded Gateway from being launched before Playwright starts its isolated fixture. A process-scoped `BUILD_VITE_MAX_OLD_SPACE_MB` override was added for constrained local validation; CI continues to use dynamically sized heap allocation without a global `NODE_OPTIONS` setting.

The public Anthropic skill bundle remains pinned to the fetched commit recorded in `build/preinstalled-skills/.preinstalled-lock.json`. A reviewed `manus-runtime-compatibility` adapter was added to the curated preinstalled set. It translates Manus-style requests into existing Cina-Claw-Pro/OpenClaw capabilities, enforces explicit credential and workspace boundaries, and does not copy proprietary Manus system instructions, internal tool schemas, or credentials.

## Validation evidence

TypeScript node and web type-checks pass. The curated manifest test passes with 41 local adapters, including strict source, path, version, name, uniqueness, and auto-enable assertions. Targeted preinstalled-skill, bundled-default, and local-skill-loader unit tests pass. The production Vite build has been corrected but could not complete inside the 3.8 GiB development sandbox because the dependency graph exceeds the available local heap; hosted runners remain the authoritative build environment for this gate.

The prior hosted Electron E2E failure was cross-platform and timed out before test progress after the Electron renderer loaded. The common cause was the build command running Vite in watch/development mode and starting Electron through the plugin before Playwright. The next hosted run must verify that the build step exits before the E2E test command begins.

## Dependency decision

An attempted broad package refresh was reverted to the gateway-verified baseline because it moved Electron from 40.10.6 to 43.4.0, Vite from 7.3.5 to 8.2.1, and other integration packages across major or compatibility-sensitive lines. Existing runtime-compatibility tests and Monaco worker resolution failed under that refresh. No package update is included until each upgrade is separately validated against the OpenClaw gateway and all three desktop CI environments.

## Remaining release gates

PR #19 must receive a fresh hosted E2E run after these fixes. The GitHub Advanced Security AI-finding check remains an external hosted CAPI failure rather than a code finding. Windows publication of v1.0.4 should proceed only after the required checks are green or the repository’s documented exception policy is applied.
