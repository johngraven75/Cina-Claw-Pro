# Manus Compatibility and Provenance

Cina-Claw-Pro bundles the public Anthropic Agent Skills entries listed in `preinstalled-manifest.json` and a local `manus-runtime-compatibility` adapter. The adapter is intentionally an implementation-neutral compatibility layer: it does not copy proprietary Manus system instructions, internal tool schemas, connector credentials, or restricted runtime behavior.

The adapter routes Manus-style requests through Cina-Claw-Pro and OpenClaw capabilities that are already present in the application. It requires explicit connector configuration for external services, keeps downloaded instructions untrusted, and uses bounded local execution for deterministic work.

When `openrouter/free` is active, the adapter treats model identity and capabilities as dynamic, keeps context compact, serializes rate-limited work, handles 429 and provider-capacity failures with bounded retries, and falls back to text-only or manual-confirmation paths when a routed model cannot support a requested tool or modality. It never silently upgrades to a paid model or forwards private data to another provider.

The public Anthropic skill entries retain their upstream `SKILL.md` and license files. Local adapters use the repository’s `cina-curated-YYYY.MM.DD` version convention and are included through the normal preinstalled-skill bundle, lockfile, and startup installer. Every reviewed manifest entry is auto-enabled on first installation and re-enabled on subsequent starts when it remains Cina-Claw-managed; user-managed skills are never overwritten or enabled without an explicit operator choice.

The shared agent policy applies to every bundled skill, including reviewed third-party reasoning, planning, research, and development workflow catalogs. Plugin-provided capabilities are treated as optional runtime tools: the agent verifies installation, enablement, configuration, and tool support before use, and falls back safely when a free-routed model or unavailable plugin cannot complete the requested action.
