# Cina-Claw-Pro v1.0.5 Carry-Forward Report

## Scope

This report records the v1.0.5 release state for OpenRouter Free routing, managed reasoning workflows, official OpenAI concept adapters, and the Windows publication gate.

## Completed in this iteration

Cina-Claw Pro now defaults a genuinely fresh installation to `openrouter/free` while preserving upgraded installations and explicit operator choices. The runtime adds standard OpenRouter configuration only when absent and limits primary-agent and subagent concurrency to one only when OpenRouter Free is active and the operator has not set a value.

The shared agent context and runtime adapter require compact staged reasoning, explicit intermediate artifacts, bounded retries, bounded delegation, capability checks, and text/manual fallbacks. Core reasoning skills are managed and enabled: developer workflow routing, Manus runtime compatibility, goal definition, Codex migration, threat modeling, the Ralphex family, research synthesis, and Swarms workflows.

The managed preinstalled catalog now contains 102 skills, including 44 original CinaClaw adapters for official OpenAI Codex and ChatGPT skill concepts. The adapters use unique managed slugs, record source provenance, and do not copy upstream instructions, scripts, or assets. User-managed and marketplace skills remain untouched.

The release branch was rebased onto the current main branch. The packaged gateway runtime test was updated to the current Electron 41.10.3 and WebSocket 8.21.0 pins, resolving the stale expectation that failed hosted pull-request merge checks.

## Validation evidence

The reusable `openrouter-free-skill-adaptation` audit passes all five checks: fresh OpenRouter Free startup default, free-router capability and concurrency safeguards, shared reasoning policy, staged-work runtime guidance, and managed core-reasoning-skill enablement.

The OpenAI adapter regression tests pass. The preinstalled manifest, managed catalog, and carry-forward tests pass. The production preinstalled-skill bundle includes all 102 declared skills, including 44 adapted OpenAI workflows. Node and web type checks pass. Lint passes with seven pre-existing Fast Refresh warnings and no errors. The Windows build must be rerun for version 1.0.5 after version metadata is committed.

## Remaining release gates

Before publication, complete the v1.0.5 Windows packaging run, verify the NSIS executable, blockmap, unpacked executable, artifact sizes, and SHA-256 checksums, and confirm the updated hosted PR checks on the rebased branch. Merge the PR only after required checks are green or a documented repository exception is applied. Create and publish the `v1.0.5` GitHub release from the merged release commit with the verified Windows installer and blockmap attached.
