import { expect, test } from './fixtures/electron';

test.describe('Downloads and image generation', () => {
  test('downloads page is reachable from the sidebar and shows its form', async ({ page }) => {
    await page.getByTestId('setup-skip-button').click();
    await expect(page.getByTestId('main-layout')).toBeVisible();

    await page.getByTestId('sidebar-nav-downloads').click();
    await expect(page.getByTestId('downloads-page')).toBeVisible();
    await expect(page.getByTestId('downloads-page-title')).toBeVisible();
    await expect(page.getByTestId('downloads-url-input')).toBeVisible();
    await expect(page.getByTestId('downloads-start-button')).toBeVisible();
    await expect(page.getByTestId('downloads-start-button')).toBeDisabled();
  });

  test('image generation is reachable in a release build (no dev-mode gate)', async ({ page }) => {
    await page.getByTestId('setup-skip-button').click();
    await expect(page.getByTestId('main-layout')).toBeVisible();

    await page.getByTestId('sidebar-nav-image-generation').click();
    await expect(page.getByTestId('image-generation-page')).toBeVisible();
  });
});
