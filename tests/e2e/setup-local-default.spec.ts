import { expect, test } from './fixtures/electron';

test('first boot truthfully explains the OpenRouter Ox Alpha prerequisite', async ({ page }) => {
  const guidance = page.getByTestId('openrouter-free-prerequisite');
  await expect(guidance).toBeVisible();
  await expect(guidance).toContainText('Ox Alpha');
  await expect(guidance).toContainText('never upgrades to a paid model automatically');
  await expect(guidance.getByText('stealth/ox-alpha', { exact: true })).toBeVisible();
});
