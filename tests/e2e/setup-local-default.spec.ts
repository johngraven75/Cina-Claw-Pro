import { expect, test } from './fixtures/electron';

test('first boot truthfully explains the local Ollama default', async ({ page }) => {
  const guidance = page.getByTestId('first-boot-default-prerequisite');
  await expect(guidance).toBeVisible();
  await expect(guidance).toContainText('Ollama');
  await expect(guidance).toContainText('qwen3-vl:8b-instruct');
  await expect(guidance).toContainText('never switches to a paid model automatically');
  // The rendered <code> element carries the OpenRouter successor id: the
  // retired stealth/ox-alpha must never appear here again.
  await expect(guidance.getByText('z-ai/glm-5.3-flash', { exact: true })).toBeVisible();
  await expect(guidance.getByText('stealth/ox-alpha')).toHaveCount(0);
});
