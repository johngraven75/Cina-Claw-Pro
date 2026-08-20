#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCinaClawOpenAiAdapter } from './openai-skill-adapter.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = process.env.OPENAI_SKILLS_SOURCE || '/home/ubuntu/openai-skills-catalog';
const sourceSkillsRoot = join(sourceRoot, 'skills');
const targetRoot = join(root, 'resources', 'skills', 'curated');
const manifestPath = join(root, 'resources', 'skills', 'preinstalled-manifest.json');
const version = 'cina-curated-2026.08.18';

function findSkillDirectories(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (!entry.isDirectory()) continue;
    if (existsSync(join(fullPath, 'SKILL.md'))) {
      result.push(fullPath);
      continue;
    }
    result.push(...findSkillDirectories(fullPath));
  }
  return result;
}

if (!existsSync(sourceSkillsRoot)) {
  throw new Error(`Official OpenAI skills source not found: ${sourceSkillsRoot}`);
}

const skillDirectories = findSkillDirectories(sourceSkillsRoot).sort();
const usedSlugs = new Set();
const imported = [];
for (const sourceDirectory of skillDirectories) {
  const repoPath = relative(sourceRoot, sourceDirectory).replaceAll('\\', '/');
  const sourceSlug = sourceDirectory.split(/[\\/]/).pop();
  const sourceGroup = repoPath.includes('/.system/') ? 'system' : 'curated';
  const slug = `openai-${sourceGroup}-${sourceSlug}`;
  if (usedSlugs.has(slug)) throw new Error(`Duplicate derived adapter slug: ${slug}`);
  usedSlugs.add(slug);

  const targetDirectory = join(targetRoot, slug);
  rmSync(targetDirectory, { recursive: true, force: true });
  mkdirSync(targetDirectory, { recursive: true });
  writeFileSync(
    join(targetDirectory, 'SKILL.md'),
    createCinaClawOpenAiAdapter({ slug, sourceSlug, repoPath }),
    'utf8',
  );
  imported.push({ slug, repoPath });
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.source = 'Reviewed official remote skills and repository-local curated adapters, including original CinaClaw adaptations of official OpenAI Codex and ChatGPT skill concepts';
manifest.policy = 'All reviewed bundled skills, including original CinaClaw adapters for official OpenAI Codex and ChatGPT skill concepts, third-party reasoning workflows, and catalog adapters, are enabled automatically under the shared OpenRouter Free compatibility policy; marketplace installs remain explicit.';
manifest.skills = manifest.skills.filter((entry) => !String(entry.slug).startsWith('openai-curated-') && !String(entry.slug).startsWith('openai-system-'));
manifest.skills.push(...imported.map(({ slug }) => ({
  slug,
  localPath: `resources/skills/curated/${slug}`,
  version,
  autoEnable: true,
})));
manifest.skills.sort((left, right) => left.slug.localeCompare(right.slug));
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({ imported: imported.length, slugs: imported.map((entry) => entry.slug) }, null, 2));
