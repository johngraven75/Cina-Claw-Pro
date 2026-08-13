import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  materializeLocalSkills,
  validateManifestEntries,
} from '../scripts/preinstalled-skill-sources.mjs';

test('preinstalled manifest supports exactly one remote or local source per skill', () => {
  const parsed = validateManifestEntries([
    { slug: 'remote', repo: 'owner/repo', repoPath: 'skills/remote', ref: 'main' },
    { slug: 'local', localPath: 'resources/skills/curated/local', version: 'curated-1' },
  ]);

  assert.deepEqual(parsed.remote.map((entry) => entry.slug), ['remote']);
  assert.deepEqual(parsed.local.map((entry) => entry.slug), ['local']);
  assert.throws(
    () => validateManifestEntries([{ slug: 'ambiguous', repo: 'owner/repo', repoPath: 'skills/x', localPath: 'skills/x' }]),
    /exactly one source/,
  );
  assert.throws(
    () => validateManifestEntries([{ slug: 'missing' }]),
    /exactly one source/,
  );
});

test('local skill materialization stays inside the repository and records provenance', () => {
  const root = mkdtempSync(join(tmpdir(), 'cina-curated-skill-'));
  const outputRoot = join(root, 'output');
  try {
    const skillDir = join(root, 'resources', 'skills', 'curated', 'example');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, 'SKILL.md'), '---\nname: example\ndescription: Example.\n---\n', 'utf8');

    const lockEntries = materializeLocalSkills({
      root,
      outputRoot,
      entries: [{ slug: 'example', localPath: 'resources/skills/curated/example', version: 'curated-1' }],
    });

    assert.equal(readFileSync(join(outputRoot, 'example', 'SKILL.md'), 'utf8').includes('name: example'), true);
    assert.deepEqual(lockEntries, [{
      slug: 'example',
      version: 'curated-1',
      sourceType: 'local',
      localPath: 'resources/skills/curated/example',
    }]);
    assert.throws(
      () => materializeLocalSkills({
        root,
        outputRoot,
        entries: [{ slug: 'escape', localPath: '../outside', version: 'curated-1' }],
      }),
      /outside repository/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('all 40 reviewed Cina adapters are declared, auto-enabled, and name-aligned', () => {
  const root = new URL('..', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('resources/skills/preinstalled-manifest.json', root), 'utf8'));
  const localEntries = manifest.skills.filter((entry) => entry.localPath);
  const curatedRoot = new URL('resources/skills/curated/', root);
  const directories = readdirSync(curatedRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.equal(localEntries.length, 40);
  assert.deepEqual(localEntries.map((entry) => entry.slug).sort(), directories);
  assert.equal(new Set(manifest.skills.map((entry) => entry.slug)).size, manifest.skills.length);
  assert.deepEqual(
    ['google-agent-skills-catalog', 'voltagent-awesome-agent-skills-catalog']
      .filter((slug) => !localEntries.some((entry) => entry.slug === slug)),
    [],
  );

  for (const entry of localEntries) {
    assert.equal(entry.autoEnable, true, `${entry.slug} must be auto-enabled`);
    assert.equal(entry.localPath, `resources/skills/curated/${entry.slug}`);
    assert.match(entry.version, /^cina-curated-\d{4}\.\d{2}\.\d{2}$/);
    const skill = readFileSync(new URL(`${entry.localPath}/SKILL.md`, root), 'utf8');
    assert.match(skill, new RegExp(`^name: ${entry.slug}$`, 'm'));
  }
});

test('catalog searchers reject empty queries instead of returning arbitrary skills', () => {
  const root = new URL('..', import.meta.url);
  for (const slug of ['google-agent-skills-catalog', 'voltagent-awesome-agent-skills-catalog']) {
    const skillRoot = new URL(`resources/skills/curated/${slug}/`, root);
    const result = spawnSync(
      'python3',
      [
        fileURLToPath(new URL('scripts/search_catalog.py', skillRoot)),
        fileURLToPath(new URL('references/catalog.json', skillRoot)),
        '   ',
      ],
      { encoding: 'utf8' },
    );

    assert.equal(result.status, 2, `${slug} should reject an empty query`);
    assert.match(result.stderr, /query must not be empty/);
    assert.equal(result.stdout, '');
  }
});
