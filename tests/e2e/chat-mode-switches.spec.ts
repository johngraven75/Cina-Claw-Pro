/**
 * DRAFT E2E — chat mode switches + bounded autonomy. NOT RUN in this
 * draft (no pnpm install / Playwright run was possible in the VM; see
 * the parent report). Cases below follow the chat-model-picker.spec.ts
 * fixture pattern (launchElectronApp({ skipSetup: true }) +
 * getStableWindow) and must be run against a built Electron app before
 * this draft is called verified.
 *
 * Covered here:
 *   1. Modes button + Supervised badge visible next to the model picker.
 *   2. Toggling Reasoning off in the panel flips its switch state.
 *   3. (SKIPPED — needs an ACP permission harness) With Code Execution
 *      off, an exec permission request is auto-declined; with Full
 *      Autonomy on, a dangerous permission request still pauses as a
 *      permission card instead of being auto-approved.
 */
import { expect, getStableWindow, test } from './fixtures/electron';

test.describe('ClawX chat mode switches', () => {
  test('shows the modes button with a Supervised autonomy badge by default', async ({ launchElectronApp }) => {
    const app = await launchElectronApp({ skipSetup: true });
    try {
      const page = await getStableWindow(app);
      await expect(page.getByTestId('chat-mode-switches-button')).toBeVisible();
      await expect(page.getByTestId('chat-autonomy-badge')).toContainText('Supervised');
      await page.getByTestId('chat-mode-switches-button').click();
      await expect(page.getByTestId('chat-mode-switches-panel')).toBeVisible();
      await expect(page.getByTestId('chat-autonomy-select')).toHaveValue('supervised');
    } finally {
      await app.close();
    }
  });

  test('toggling Reasoning off flips the switch state for the session', async ({ launchElectronApp }) => {
    const app = await launchElectronApp({ skipSetup: true });
    try {
      const page = await getStableWindow(app);
      await page.getByTestId('chat-mode-switches-button').click();
      const reasoning = page.getByTestId('chat-mode-reasoning');
      await expect(reasoning).toHaveAttribute('data-state', 'checked');
      await reasoning.click();
      await expect(reasoning).toHaveAttribute('data-state', 'unchecked');
    } finally {
      await app.close();
    }
  });

  test.skip('exec permission auto-declines with Code Execution off and still pauses under Full Autonomy', async () => {
    // Needs an ACP harness that can inject a permission request for an
    // exec-like tool call into a live session (see
    // tests/unit/acp-chat-store.test.ts permission fixtures for the
    // request shape). Expected: Code Execution off -> the permission
    // card resolves to cancelled without a user click; Full Autonomy on
    // -> the same card stays pending until the user picks an option.
    // Never assert an auto-allow: autonomy must never approve.
  });
});
