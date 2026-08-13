import { expect, test } from './fixtures/electron';

test('first boot truthfully explains the private local-model prerequisite', async ({ page }) => {
  const guidance = page.getByTestId('local-model-prerequisite');
  await expect(guidance).toBeVisible();
  await expect(guidance).toContainText('Qwen3 VL 8B');
  await expect(guidance).toContainText('will not send your request to a cloud fallback');
  await expect(guidance.getByText('ollama pull qwen3-vl:8b')).toBeVisible();
});
