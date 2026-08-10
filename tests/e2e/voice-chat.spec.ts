import { completeSetup, expect, test } from './fixtures/electron';

test.describe('Cina-Claw Pro voice chat', () => {
  test('offers ten profiles and chat voice controls', async ({ page }) => {
    await completeSetup(page);
    await page.getByTestId('sidebar-nav-settings').click();
    await expect(page.getByTestId('voice-settings')).toBeVisible();
    await expect(page.getByTestId('voice-profile-grid').getByRole('button')).toHaveCount(10);

    await page.getByTestId('voice-profile-atlas').click();
    await expect(page.getByTestId('voice-profile-atlas')).toHaveAttribute('aria-pressed', 'true');

    await page.evaluate(() => { window.location.hash = '#/'; });
    await expect(page.getByTestId('chat-voice-microphone')).toBeVisible();
    await expect(page.getByTestId('chat-voice-auto-read')).toHaveAttribute('aria-pressed', 'true');
  });
});
