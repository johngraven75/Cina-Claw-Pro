// Validates shared/free-models/catalog.json without any app dependencies.
// Run: node --test tests/free-model-catalog.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const catalog = JSON.parse(readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'shared', 'free-models', 'catalog.json'),
  'utf8',
));

test('catalog has exactly 30 models, ranks 1-30, unique HF IDs', () => {
  assert.equal(catalog.models.length, 30);
  assert.deepEqual(catalog.models.map((m) => m.rank), Array.from({ length: 30 }, (_, i) => i + 1));
  assert.equal(new Set(catalog.models.map((m) => m.hfId)).size, 30);
});

test('every model is multimodal, has a route, licence and setup note', () => {
  for (const m of catalog.models) {
    assert.ok(m.modalities.includes('image'), `${m.hfId} must include image`);
    assert.ok(m.modalities.includes('text'), `${m.hfId} must include text`);
    assert.ok(m.route?.type && m.route?.ref, `${m.hfId} needs a route`);
    assert.ok(m.license, `${m.hfId} needs a licence`);
    assert.ok(m.setupNeeded, `${m.hfId} needs a setup note`);
    assert.ok(['native-thinking', 'thinking-control', 'thinking-toggle', 'prompted-cot'].includes(m.reasoning), `${m.hfId} reasoning value`);
  }
});

test('exactly 10 uncensored models, all local-only and never defaults', () => {
  const uncensored = catalog.models.filter((m) => m.uncensored);
  assert.equal(uncensored.length, 10);
  assert.deepEqual(uncensored.map((m) => m.rank), [21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
  for (const m of uncensored) {
    assert.notEqual(m.route.type, 'openrouter-free', `${m.hfId} must not route through a shared cloud endpoint by default`);
    assert.notEqual(m.tier, 'cloud-instant', `${m.hfId} must not be a cloud-instant default`);
  }
});

test('no secrets or keys are stored in the catalog', () => {
  const text = JSON.stringify(catalog);
  assert.ok(!/sk-[A-Za-z0-9]{8,}/.test(text), 'no API-key-like values');
  assert.ok(!/hf_[A-Za-z0-9]{8,}/.test(text), 'no HF-token-like values');
});

test('cloud-instant rows are honest about live verification', () => {
  for (const m of catalog.models.filter((x) => x.tier === 'cloud-instant')) {
    assert.match(m.setupNeeded, /VERIFY/, `${m.hfId} must warn that :free availability must be verified live`);
  }
});
