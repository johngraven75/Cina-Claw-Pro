---
name: headroom-optimizer
description: Plan, configure, validate, and troubleshoot chopratejas/headroom, a local context-optimization proxy/library for coding agents and LLM applications. Use for Headroom wrap/unwrap, proxy, compression, savings, memory, code graph, or verbosity tuning.
---

# Headroom Optimizer

Treat Headroom as a proxy in the model-data path. Inspect first, explain data flow, and require explicit authorization before wrapping an agent or changing its configuration.

## Workflow

1. Determine the target agent/application, installed Headroom version, endpoint/provider, and optimization goal.
2. Inspect availability with command -v headroom, headroom --version, and relevant help. Consult current official docs for exact flags.
3. Before setup, explain which prompts/responses pass through the proxy, where caches/memory live, and whether any optional component sends data elsewhere.
4. Preview configuration changes and identify the exact files/environment variables affected.
5. After an authorized change, verify proxy health with a minimal non-sensitive request, compare token behavior, and document unwrap/rollback.
6. Distinguish measured savings from estimates and preserve task correctness over token reduction.

## Safety boundaries

- Do not install Headroom, run headroom wrap/unwrap, start a proxy, edit Codex/Claude config, or enable startup persistence without explicit authorization.
- Do not enable memory, code-graph indexing, session learning, output shaping, holdouts, telemetry, or remote backends by default.
- headroom learn --verbosity reads prior sessions; run only on explicit request, preview first, and obey filesystem access restrictions.
- Never expose model API keys or log raw proprietary prompts/responses.
- Preserve upstream dependency exclusions and audit current packages; never force ast-grep-cli 0.44.1, which upstream identifies as compromised.

Source: https://github.com/chopratejas/headroom (redirects to headroomlabs-ai/headroom; Apache-2.0). The executable is not bundled.
