import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from './fixtures/electron';

test.describe('Persona page', () => {
  test('creates, saves and reloads Soul, Memory and System Prompt files', async ({
    page,
    homeDir,
  }) => {
    await expect(page.getByTestId('setup-page')).toBeVisible();
    await page.getByTestId('setup-skip-button').click();

    await expect(page.getByTestId('main-layout')).toBeVisible();
    await page.getByTestId('sidebar-nav-persona').click();

    await expect(page.getByTestId('persona-page')).toBeVisible();
    await expect(page.getByTestId('persona-path')).toHaveText(/SOUL\.md/);

    // Soul does not exist in the isolated home yet: saving creates it.
    const soulPath = join(homeDir, '.openclaw', 'workspace', 'SOUL.md');
    await page.getByTestId('persona-editor').fill('# Soul\n\nE2E persona test.');
    await page.getByTestId('persona-save').click();
    // The status element is also used for errors, so assert the saved text.
    await expect(page.getByTestId('persona-status')).toHaveText(/Saved/);
    await expect(readFile(soulPath, 'utf8')).resolves.toBe('# Soul\n\nE2E persona test.');

    // Reloading shows the saved content, not the empty draft.
    await page.getByTestId('persona-reload').click();
    await expect(page.getByTestId('persona-editor')).toHaveValue('# Soul\n\nE2E persona test.');

    // Memory: create through the same path, then verify on disk.
    await page.getByTestId('persona-tab-memory').click();
    await expect(page.getByTestId('persona-path')).toHaveText(/MEMORY\.md/);
    await page.getByTestId('persona-editor').fill('# Memory\n\nE2E memory note.');
    await page.getByTestId('persona-save').click();
    await expect(page.getByTestId('persona-status')).toHaveText(/Saved/);
    const memoryPath = join(homeDir, '.openclaw', 'workspace', 'MEMORY.md');
    await expect(readFile(memoryPath, 'utf8')).resolves.toBe('# Memory\n\nE2E memory note.');

    // System Prompt edits AGENTS.md, not a new file name.
    await page.getByTestId('persona-tab-system').click();
    await expect(page.getByTestId('persona-path')).toHaveText(/AGENTS\.md/);
    await page.getByTestId('persona-editor').fill('# AGENTS.md\n\nE2E system prompt.');
    await page.getByTestId('persona-save').click();
    await expect(page.getByTestId('persona-status')).toHaveText(/Saved/);
    const agentsPath = join(homeDir, '.openclaw', 'workspace', 'AGENTS.md');
    await expect(readFile(agentsPath, 'utf8')).resolves.toBe('# AGENTS.md\n\nE2E system prompt.');
  });
});
