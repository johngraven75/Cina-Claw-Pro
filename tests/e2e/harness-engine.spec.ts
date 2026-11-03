/**
 * DRAFT E2E — Cina harness engine selection. NOT RUN in this draft (no
 * pnpm install / Playwright run was possible in the VM; see the parent
 * report). Follows the chat-mode-switches.spec.ts fixture pattern
 * (launchElectronApp({ skipSetup: true }) + getStableWindow) and must
 * be run against a built Electron app before this draft is called
 * verified.
 *
 * Covered here:
 *   1. The Chat modes panel shows a harness Engine section.
 *   2. OpenClaw is the selected engine by default.
 *   3. The Direct option is disabled and its stub note is visible —
 *      Direct must never appear as a working engine choice.
 */
import { expect, getStableWindow, test } from './fixtures/electron';

test.describe('Cina harness engine selection', () => {
  test('shows OpenClaw selected and Direct disabled with its stub note', async ({ launchElectronApp }) => {
    const app = await launchElectronApp({ skipSetup: true });
    try {
      const page = await getStableWindow(app);
      await page.getByTestId('chat-mode-switches-button').click();
      await expect(page.getByTestId('chat-mode-switches-panel')).toBeVisible();
      await expect(page.getByTestId('harness-engine-section')).toBeVisible();
      await expect(page.getByTestId('harness-engine-select')).toHaveValue('openclaw');
      await expect(
        page.getByTestId('harness-engine-select').locator('option[value="direct"]'),
      ).toBeDisabled();
      await expect(page.getByTestId('harness-engine-stub-note')).toContainText('not available yet');
    } finally {
      await app.close();
    }
  });
});
