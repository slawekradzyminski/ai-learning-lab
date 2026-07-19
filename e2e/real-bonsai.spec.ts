import { expect, test } from '@playwright/test';

const realBonsaiEnabled = process.env.E2E_REAL_BONSAI === '1';
const model = process.env.E2E_BONSAI_MODEL || 'hf.co/prism-ml/Bonsai-27B-gguf:Q1_0';

test.skip(!realBonsaiEnabled, 'Requires the full Awesome LocalStack stack with Docker Model Runner');

test('login returns to the Lab and both offline and real Bonsai modes work', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/learn/next-token');

  await expect(page).toHaveURL(/\/login\?returnTo=%2Flearn%2Fnext-token$/);
  await page.getByTestId('login-username-input').fill('client');
  await page.getByTestId('login-password-input').fill('client');
  await page.getByTestId('login-submit-button').click();

  await expect(page).toHaveURL(/\/learn\/next-token$/);
  await expect(page.getByTestId('next-token-static-notice')).toContainText('not live model output');
  await expect(page.getByTestId('next-token-result')).toContainText('·tired');

  await page.getByRole('button', { name: 'Live model' }).click();
  await page.getByTestId('next-token-live-model').fill(model);
  await page.getByTestId('next-token-live-run').click();

  await expect(page.getByText('Live Ollama logprobs')).toBeVisible({ timeout: 90_000 });
  await expect(page.getByTestId('next-token-row-0')).toBeVisible();
  await expect(page.getByTestId('next-token-captured-mass')).toContainText('captured mass');

  await page.getByRole('button', { name: 'Offline example' }).click();
  await expect(page.getByTestId('next-token-static-notice')).toContainText('not live model output');

  await page.goto('/learn/how-llm-works/course/tokenization');
  await page.getByTestId('tokenization-mode-bonsai').click();
  await expect(page.getByTestId('tokenization-source')).toContainText('Qwen3.6 tokenizer used by Bonsai 27B');
  await page.getByTestId('tokenization-verify').click();
  await expect(page.getByTestId('tokenization-live-badge')).toContainText('Live Bonsai 27B', { timeout: 90_000 });
  await expect(page.getByTestId('tokenization-runtime-count')).toContainText('11');
  await expect(page.getByText('Counts match')).toBeVisible();
});
