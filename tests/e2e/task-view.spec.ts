import { expect, test } from './fixtures/electron';

test.describe('Manus-style TaskView split screen', () => {
  test('toggles a task header and a live Steps panel beside chat', async ({ page }) => {
    await expect(page.getByTestId('setup-page')).toBeVisible();
    await page.getByTestId('setup-skip-button').click();

    await expect(page.getByTestId('main-layout')).toBeVisible();
    await expect(page.getByTestId('chat-page')).toBeVisible();

    await page.getByTestId('chat-task-view-toggle').click();
    await expect(page.getByTestId('task-view-header')).toBeVisible();
    await expect(page.getByTestId('artifact-panel-aside')).toBeVisible();
    await expect(page.getByTestId('artifact-panel-tab-steps')).toBeVisible();

    await page.getByTestId('artifact-panel-tab-steps').click();
    await expect(page.getByTestId('task-steps-view')).toBeVisible();

    await page.getByTestId('task-view-close').click();
    await expect(page.getByTestId('task-view-header')).toHaveCount(0);
  });
});
