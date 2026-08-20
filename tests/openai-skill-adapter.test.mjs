import test from 'node:test';
import assert from 'node:assert/strict';
import { createCinaClawOpenAiAdapter, OPENAI_SKILL_ADAPTER_ID } from '../scripts/openai-skill-adapter.mjs';

test('creates a uniquely named ChatGPT adapter with CinaClaw and free-router safeguards', () => {
  const skill = createCinaClawOpenAiAdapter({
    slug: 'openai-curated-chatgpt-apps',
    sourceSlug: 'chatgpt-apps',
    repoPath: 'skills/.curated/chatgpt-apps',
  });

  assert.match(skill, /^name: openai-curated-chatgpt-apps$/m);
  assert.match(skill, /ChatGPT Apps integration/);
  assert.match(skill, new RegExp(OPENAI_SKILL_ADAPTER_ID));
  assert.match(skill, /OpenRouter Free compatibility/);
  assert.match(skill, /Do not silently select a paid model/);
  assert.match(skill, /does not copy upstream skill instructions/);
});

test('adapts Codex-native workflows without assuming Codex-only capabilities', () => {
  const skill = createCinaClawOpenAiAdapter({
    slug: 'openai-curated-migrate-to-codex',
    sourceSlug: 'migrate-to-codex',
    repoPath: 'skills/.curated/migrate-to-codex',
  });

  assert.match(skill, /^name: openai-curated-migrate-to-codex$/m);
  assert.match(skill, /Codex-compatible project structure/);
  assert.match(skill, /Treat Codex-only tools/);
  assert.match(skill, /explicit confirmation/);
});
