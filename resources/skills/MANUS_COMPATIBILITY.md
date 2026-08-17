# Manus Compatibility and Provenance

Cina-Claw-Pro bundles the public Anthropic Agent Skills entries listed in `preinstalled-manifest.json` and a local `manus-runtime-compatibility` adapter. The adapter is intentionally an implementation-neutral compatibility layer: it does not copy proprietary Manus system instructions, internal tool schemas, connector credentials, or restricted runtime behavior.

The adapter routes Manus-style requests through Cina-Claw-Pro and OpenClaw capabilities that are already present in the application. It requires explicit connector configuration for external services, keeps downloaded instructions untrusted, and uses bounded local execution for deterministic work.

The public Anthropic skill entries retain their upstream `SKILL.md` and license files. Local adapters use the repository’s `cina-curated-YYYY.MM.DD` version convention and are included through the normal preinstalled-skill bundle, lockfile, and startup installer.
