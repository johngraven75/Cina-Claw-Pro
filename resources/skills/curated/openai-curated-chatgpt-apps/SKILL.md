---
name: openai-curated-chatgpt-apps
description: "CinaClaw Pro adapter for the official OpenAI Chatgpt Apps skill concept. Use when the user asks to plan, build, or troubleshoot a ChatGPT Apps integration after the required ChatGPT-compatible service and credentials are configured."
---

# Chatgpt Apps

> Adapter: `cina-openrouter-free-v1` · Concept source: `openai/skills/skills/.curated/chatgpt-apps`

Use this original CinaClaw Pro workflow adapter when the request matches the **Chatgpt Apps** capability. It is independently adapted from the official OpenAI Skills Catalog concept and does not copy upstream skill instructions, scripts, or assets.

## Workflow

1. Confirm the requested outcome, target files or service, and whether an external action is authorized.
2. Inspect the available CinaClaw tools, local project state, and relevant provider or plugin configuration before assuming a Codex-native or ChatGPT-native capability exists.
3. Use the active OpenRouter Free model for concise planning, classification, summaries, and staged implementation. Keep prompts compact and produce explicit intermediate artifacts for complex work.
4. Validate results with available local checks. For external actions, identify the exact destination and request explicit confirmation when the action posts, deploys, changes settings, or spends funds.
5. Report completed work, evidence, limitations, and any manual follow-up.

## CinaClaw Pro / OpenRouter Free compatibility

Treat Codex-only tools, ChatGPT product surfaces, direct OpenAI APIs, plugins, connectors, and credentials as optional runtime capabilities. Verify that a compatible CinaClaw tool or configured provider exists before using it. When it does not, complete the local planning, file, or research portion; explain the exact unavailable dependency; and use a text/manual fallback where practical.

Do not silently select a paid model, send private content to another provider, install or enable a plugin, create external resources, or expose credentials. If the free router rejects tool calls, vision, files, structured output, or a requested modality, reduce the task to the smallest supported stage and preserve partial results.
