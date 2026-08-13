import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';

function shouldCopySkillFile(srcPath) {
  const base = basename(srcPath);
  return base !== '.git' && base !== '.subset.tar';
}

export function validateManifestEntries(entries) {
  if (!Array.isArray(entries)) {
    throw new Error('Invalid preinstalled-skills manifest format');
  }

  const slugs = new Set();
  const local = [];
  const remote = [];
  for (const entry of entries) {
    if (!entry?.slug || slugs.has(entry.slug)) {
      throw new Error(`Invalid or duplicate manifest slug: ${JSON.stringify(entry)}`);
    }
    slugs.add(entry.slug);

    const hasLocal = typeof entry.localPath === 'string' && entry.localPath.trim().length > 0;
    const hasRemote = typeof entry.repo === 'string' && entry.repo.trim().length > 0
      && typeof entry.repoPath === 'string' && entry.repoPath.trim().length > 0;
    if (hasLocal === hasRemote) {
      throw new Error(`Manifest entry must declare exactly one source: ${JSON.stringify(entry)}`);
    }
    if (hasLocal) {
      if (!entry.version?.trim()) {
        throw new Error(`Local manifest entry requires a version: ${JSON.stringify(entry)}`);
      }
      local.push(entry);
    } else {
      remote.push(entry);
    }
  }
  return { local, remote };
}

export function materializeLocalSkills({ root, outputRoot, entries }) {
  const resolvedRoot = resolve(root);
  mkdirSync(outputRoot, { recursive: true });
  const lockEntries = [];

  for (const entry of entries) {
    if (isAbsolute(entry.localPath)) {
      throw new Error(`Local skill path is outside repository: ${entry.localPath}`);
    }
    const sourceDir = resolve(resolvedRoot, entry.localPath);
    const relativeSource = relative(resolvedRoot, sourceDir);
    if (!relativeSource || relativeSource.startsWith('..') || isAbsolute(relativeSource)) {
      throw new Error(`Local skill path is outside repository: ${entry.localPath}`);
    }
    const sourceManifest = join(sourceDir, 'SKILL.md');
    if (!existsSync(sourceManifest)) {
      throw new Error(`Local skill ${entry.slug} is missing SKILL.md: ${entry.localPath}`);
    }

    const targetDir = join(outputRoot, entry.slug);
    rmSync(targetDir, { recursive: true, force: true });
    cpSync(sourceDir, targetDir, { recursive: true, dereference: true, filter: shouldCopySkillFile });
    lockEntries.push({
      slug: entry.slug,
      version: entry.version.trim(),
      sourceType: 'local',
      localPath: entry.localPath,
    });
  }

  return lockEntries;
}
