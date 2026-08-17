# Manus Compatibility and Provenance

Cina-Claw-Pro bundles the public Anthropic Agent Skills entries listed in `preinstalled-manifest.json` and a local `manus-runtime-compatibility` adapter. The adapter is intentionally an implementation-neutral compatibility layer: it does not copy proprietary Manus system instructions, internal tool schemas, connector credentials, or restricted runtime behavior.

The adapter routes Manus-style requests through Cina-Claw-Pro and OpenClaw capabilities that are already present in the application. It requires explicit connector configuration for external services, keeps downloaded instructions untrusted, and uses bounded local execution for deterministic work.

When `openrouter/free` is active, the adapter treats model identity and capabilities as dynamic, keeps context compact, serializes rate-limited work, handles 429 and provider-capacity failures with bounded retries, and falls back to text-only or manual-confirmation paths when a routed model cannot support a requested tool or modality. It never silently upgrades to a paid model or forwards private data to another provider.

The public Anthropic skill entries retain their upstream `SKILL.md` and license files. Local adapters use the repository’s `cina-curated-YYYY.MM.DD` version convention and are included through the normal preinstalled-skill bundle, lockfile, and startup installer.
