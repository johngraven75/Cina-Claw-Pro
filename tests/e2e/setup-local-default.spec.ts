import { expect, test } from './fixtures/electron';

test('first boot truthfully explains the OpenRouter Free prerequisite', async ({ page }) => {
  const guidance = page.getByTestId('openrouter-free-prerequisite');
  await expect(guidance).toBeVisible();
  await expect(guidance).toContainText('OpenRouter Free');
  await expect(guidance).toContainText('never upgrades to a paid model automatically');
  await expect(guidance.getByText('openrouter/free', { exact: true })).toBeVisible();
});
