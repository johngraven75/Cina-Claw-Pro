// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const mocks = vi.hoisted(() => ({ home: '' }));

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>();
  return { ...actual, homedir: () => mocks.home || actual.homedir() };
});

vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/tmp/clawx-user-data') },
  nativeImage: { createFromPath: vi.fn() },
  shell: { openPath: vi.fn(), showItemInFolder: vi.fn() },
}));

describe('files api createText', () => {
  let testDir: string;
  let workspaceRoot: string;

  beforeEach(async () => {
    vi.resetModules();
    testDir = await mkdtemp(join(tmpdir(), 'clawx-files-create-'));
    mocks.home = testDir;
    workspaceRoot = join(testDir, '.openclaw', 'workspace');
    await mkdir(workspaceRoot, { recursive: true });
  });

  afterEach(async () => {
    mocks.home = '';
    await rm(testDir, { recursive: true, force: true });
  });

  it('creates a new file, refuses to overwrite it, and refuses outside roots', async () => {
    const { createFilesApi } = await import('../../electron/services/files-api');
    const api = createFilesApi();

    const target = join(workspaceRoot, 'SOUL.md');
    await expect(api.createText({ path: target, content: '# Soul\n' })).resolves.toEqual({
      ok: true,
    });
    expect(await readFile(target, 'utf8')).toBe('# Soul\n');

    await expect(api.createText({ path: target, content: '# Other\n' })).resolves.toEqual({
      ok: false,
      error: 'alreadyExists',
    });
    expect(await readFile(target, 'utf8')).toBe('# Soul\n');

    await expect(
      api.createText({ path: join(testDir, 'outside.txt'), content: 'x' }),
    ).resolves.toEqual({ ok: false, error: 'readOnlyRoot' });
  });
});
