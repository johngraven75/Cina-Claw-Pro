export const OPENAI_SKILL_ADAPTER_ID = 'cina-openrouter-free-v1';

const SPECIAL_PURPOSES = {
  'chatgpt-apps': 'plan, build, or troubleshoot a ChatGPT Apps integration after the required ChatGPT-compatible service and credentials are configured',
  'migrate-to-codex': 'inventory and migrate selected agent instructions or configuration into a Codex-compatible project structure without modifying unrelated files',
  'openai-docs': 'research current OpenAI or Codex documentation using available official documentation sources',
  imagegen: 'create or edit images only when a compatible CinaClaw image-generation capability is installed and enabled',
  speech: 'prepare or generate speech output only when a compatible speech provider is configured',
  transcribe: 'transcribe local audio or video using an available CinaClaw transcription capability',
  'skill-installer': 'review and install approved skills through CinaClaw-managed sources without enabling unreviewed content automatically',
  'plugin-creator': 'scaffold a local plugin configuration and validate it before any separate operator-approved enablement',
  'gh-address-comments': 'address review feedback in a GitHub repository after inspecting the exact comments and affected code',
  'gh-fix-ci': 'investigate and repair a failing GitHub Actions workflow using reproducible local checks before retrying hosted validation',
  playwright: 'write or repair browser tests using the locally available Playwright tooling',
  'playwright-interactive': 'perform interactive browser verification with explicit targets and observable results',
  'security-best-practices': 'review application code against practical security safeguards and explain the evidence behind findings',
  'security-ownership-map': 'map code ownership and security-sensitive responsibility using repository evidence',
  'security-threat-model': 'create a scoped threat model based on the target system, data flows, and available evidence',
};

function titleCase(slug) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function genericPurpose(sourceSlug) {
  return `perform the ${titleCase(sourceSlug)} workflow with CinaClaw tools and user-approved external services`;
}

export function createCinaClawOpenAiAdapter({ slug, sourceSlug, repoPath }) {
  const purpose = SPECIAL_PURPOSES[sourceSlug] || genericPurpose(sourceSlug);
  const title = titleCase(sourceSlug);

  return `---
name: ${slug}
description: "CinaClaw Pro adapter for the official OpenAI ${title} skill concept. Use when the user asks to ${purpose}."
---

# ${title}

> Adapter: \`${OPENAI_SKILL_ADAPTER_ID}\` · Concept source: \`openai/skills/${repoPath}\`

Use this original CinaClaw Pro workflow adapter when the request matches the **${title}** capability. It is independently adapted from the official OpenAI Skills Catalog concept and does not copy upstream skill instructions, scripts, or assets.

## Workflow

1. Confirm the requested outcome, target files or service, and whether an external action is authorized.
2. Inspect the available CinaClaw tools, local project state, and relevant provider or plugin configuration before assuming a Codex-native or ChatGPT-native capability exists.
3. Use the active OpenRouter Free model for concise planning, classification, summaries, and staged implementation. Keep prompts compact and produce explicit intermediate artifacts for complex work.
4. Validate results with available local checks. For external actions, identify the exact destination and request explicit confirmation when the action posts, deploys, changes settings, or spends funds.
5. Report completed work, evidence, limitations, and any manual follow-up.

## CinaClaw Pro / OpenRouter Free compatibility

Treat Codex-only tools, ChatGPT product surfaces, direct OpenAI APIs, plugins, connectors, and credentials as optional runtime capabilities. Verify that a compatible CinaClaw tool or configured provider exists before using it. When it does not, complete the local planning, file, or research portion; explain the exact unavailable dependency; and use a text/manual fallback where practical.

Do not silently select a paid model, send private content to another provider, install or enable a plugin, create external resources, or expose credentials. If the free router rejects tool calls, vision, files, structured output, or a requested modality, reduce the task to the smallest supported stage and preserve partial results.
`;
}
