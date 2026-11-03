import { expect, test } from './fixtures/electron';

test.describe('Free model catalog picker', () => {
  test('shows standard models, hides uncensored models until opt-in, and filters', async ({ page }) => {
    await expect(page.getByTestId('setup-page')).toBeVisible();
    await page.getByTestId('setup-skip-button').click();

    await expect(page.getByTestId('main-layout')).toBeVisible();
    await page.getByTestId('sidebar-nav-models').click();

    await expect(page.getByTestId('models-page')).toBeVisible();
    await expect(page.getByTestId('free-model-catalog')).toBeVisible();
    await expect(page.getByTestId('free-catalog-featured-ox-alpha')).toBeVisible();
    await expect(page.getByTestId('free-catalog-use-ox-alpha')).toBeVisible();
    await expect(page.getByTestId('free-catalog-card-1')).toBeVisible();
    // Uncensored rows (21-30) are hidden by default, never a default selection.
    await expect(page.getByTestId('free-catalog-card-21')).toHaveCount(0);

    await page.getByTestId('free-catalog-search').fill('Gemma');
    await expect(page.getByTestId('free-catalog-card-8')).toBeVisible();
    await expect(page.getByTestId('free-catalog-card-1')).toHaveCount(0);

    await page.getByTestId('free-catalog-search').fill('');
    await page.getByTestId('free-catalog-uncensored-toggle').click();
    await expect(page.getByTestId('free-catalog-card-21')).toBeVisible();
    await expect(page.getByTestId('free-catalog-card-30')).toBeVisible();

    await page.getByTestId('free-catalog-uncensored-toggle').click();
    await page.getByTestId('free-catalog-tier-one-pull').click();
    await expect(page.getByTestId('free-catalog-card-1')).toBeVisible();
    await expect(page.getByTestId('free-catalog-card-2')).toHaveCount(0);
  });
});
