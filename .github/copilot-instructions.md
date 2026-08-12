# Repository Engineering Standard

These instructions are mandatory for all AI-assisted engineering work in this repository.

## Product framing before code
Before writing code, restate the product goal in one paragraph and define the target user, measurable success criteria, non-goals, assumptions, and any missing requirements. Do not hide uncertainty; document it explicitly and proceed with the safest reasonable assumption when work is not blocked.

## Architecture first
Propose the technical architecture before implementation. Cover platform constraints, security boundaries, dependency direction, public contracts, persistence, lifecycle, observability, backward compatibility, and upgrade/rollback behavior. For Windows desktop work, explicitly address path handling and long paths, installer behavior, registry use, permissions/UAC, process and service lifecycle, MSBuild/build tooling, threading model, file locks, crash recovery, and compatibility with existing installs.

Structure implementation and completion reporting as **Frontend**, **Connector / integration**, and **Backend** when applicable; explicitly mark a layer non-applicable instead of omitting it.

## Vertical slices and isolated work
Break substantial work into small, independently testable vertical slices suitable for isolated git worktrees and branches. For every slice define:
- exact files to create or modify;
- public API/interface or cross-layer contract;
- validation and error-handling strategy;
- logging, diagnostics, and telemetry behavior;
- security and permissions implications;
- measurable definition of done.

Keep commits atomic and conventional. Do not combine unrelated changes. Preserve existing branch protections and required checks; never merge around a failing required check.

## Production code quality
Ship production-ready, secure, maintainable code rather than merely code that compiles. Code must be fresh, idiomatic, repository-specific, and follow SOLID, DRY, and modern language/framework practices. Prefer explicit types, immutable data where practical, dependency injection, narrow interfaces, deterministic cleanup, and clear separation of concerns.

Never leave TODOs, placeholders, fabricated integrations, mock data, hard-coded credentials, or incomplete production paths. Include input validation, null safety, secure defaults, bounded resource use, cancellation where appropriate, correct disposal, and defensive handling of race conditions and partial failures. Prefer cohesive root-cause fixes over piecemeal patches or generic code walls.

Preserve accepted functionality unless removal is explicitly authorized. Maintain backward compatibility for persisted data, settings, public APIs, installer state, user workflows, and upgrade paths unless a documented migration is part of the change.

## Pre-production validation in parallel
Every implementation slice must include validation appropriate to its risk:
- unit tests covering edge cases and failure modes;
- integration tests using real filesystem/OS interactions where relevant;
- contract tests for APIs and cross-process/cross-layer interfaces;
- security tests for injection, traversal, unsafe deserialization, credential exposure, permission mistakes, and privilege-escalation paths;
- performance tests with explicit measurable budgets for changed hot paths;
- manual QA checklist for UI, installer, upgrade, service, or platform-specific flows.

Run all relevant formatting, linting, static analysis, type checks, unit/integration/E2E tests, packaging checks, and user-flow validation before publication. Do not weaken or delete meaningful tests merely to obtain a green build.

## Mandatory self-review
Before presenting or committing a final implementation, mentally simulate normal and failure paths. Trace error propagation, cancellation, retries, race conditions, deadlocks, memory/resource leaks, file-handle disposal, process cleanup, privilege boundaries, rollback behavior, compatibility, and recovery from interrupted operations. Fix issues found during this review before declaring the slice complete.

## Production readiness package
Every releasable change must include, as applicable:
- clean diff summary;
- changelog/release-note entry;
- migration, installer, or upgrade notes;
- public API/interface documentation;
- environment-variable and configuration documentation;
- rollback plan;
- post-release monitoring/diagnostic plan;
- test evidence and checksums for packaged artifacts.

Completion reports must state purpose; Frontend, Connector/integration, and Backend changes; validation results; known risks/blockers; and publication status. Never claim completion, publication, signing, or test success without evidence.

## Windows desktop requirements
When this repository contains or ships a Windows desktop application, treat it as a premium Windows product. Prefer WinUI 3 or WPF best practices when applicable and preserve the repository's established framework unless migration is explicitly in scope. Ensure MSIX and MSI compatibility where supported, silent-install behavior, safe upgrades/uninstalls, auto-updater safety, background-service/process resilience, crash reporting, UAC-safe behavior, long-path handling, file-lock recovery, per-user/per-machine install semantics, and correct registry cleanup. Ensure the code builds with `build.cmd` when that entry point exists and passes all existing tests in each isolated worktree before merge or release.

## Release discipline
Commit every source, version, dependency, test, packaging, workflow, and release-note change before building. Rerun failed validation after each fix. Publish only after required validation passes and required test notes/checksums/signing evidence exist. Never expose secrets, tokens, signing material, private certificates, or private/gated model metadata in source, logs, artifacts, or UI.
