# Official OpenAI Codex and ChatGPT Skill Concept Adaptation

CinaClaw Pro includes **44 original local workflow adapters** derived from the public skill concepts catalogued by [`openai/skills`](https://github.com/openai/skills) at commit `49f948faa9258a0c61caceaf225e179651397431` on 18 August 2026. The upstream repository describes itself as a **Skills Catalog for Codex** and did not declare a repository license when this catalog was reviewed.

Accordingly, CinaClaw Pro does not copy the upstream `SKILL.md` instructions, bundled scripts, assets, or other source files. Each `openai-curated-*` and `openai-system-*` directory contains an original CinaClaw workflow adapter that names the public concept source and applies the local OpenRouter Free policy.

| Scope | Count | Enablement |
| --- | ---: | --- |
| Official OpenAI curated-skill concepts | 39 | Managed, enabled at startup |
| Official OpenAI system-skill concepts | 5 | Managed, enabled at startup |
| Total original CinaClaw adapters | 44 | Managed, enabled at startup |

Every adapter requires runtime verification of CinaClaw tools, connectors, plugin configuration, credentials, and model capabilities. ChatGPT surfaces, Codex-native tooling, direct OpenAI API calls, and third-party services remain optional dependencies rather than assumed capabilities. When OpenRouter Free lacks a requested modality or tool schema, the adapter uses compact staged prompts, bounded work, and a local text/manual fallback; it never silently switches to a paid model or forwards private content to another provider.

Marketplace and other unreviewed third-party skills are not auto-installed. User-managed skills are not overwritten or automatically enabled.
