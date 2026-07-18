import { expect, test } from '@playwright/test';

const labRoutes = [
  'tokenization', 'attention', 'residual-stream', 'next-token', 'kv-cache', 'embeddings',
  'perceptron', 'gradient-descent', 'backpropagation', 'depth', 'convolution', 'digits',
  'agent-loop', 'subagents', 'context-harness', 'memory-instructions', 'hooks-lifecycle',
  'tool-boundaries', 'agent-evals',
];

test('home exposes all content types and all 19 labs', async ({ page }) => {
  await page.goto('/learn/');

  await expect(page.getByTestId('learning-home-title')).toBeVisible();
  await expect(page.locator('[data-testid^="learning-path-"]')).toHaveCount(19);
  await expect(page.getByTestId('learning-materials-llm')).toHaveAttribute('href', '/learn/how-llm-works/materials');
  await expect(page.getByTestId('learning-materials-agent')).toHaveAttribute('href', '/learn/how-ai-agent-works/materials');
  await expect(page.getByTestId('learning-theory-llm')).toBeVisible();
  await expect(page.getByTestId('learning-theory-agent')).toBeVisible();
});

for (const route of labRoutes) {
  test(`interactive lab route renders: ${route}`, async ({ page }) => {
    await page.goto(`/learn/${route}`);
    await expect(page.getByTestId('learning-layout')).toBeVisible();
    await expect(page.getByTestId(`learning-nav-${route}`)).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('h1')).toBeVisible();
  });
}

test('complete materials indexes expose every lab and exercise handoff', async ({ page }) => {
  await page.goto('/learn/how-llm-works/materials');
  await expect(page.locator('[data-testid^="materials-lab-"]')).toHaveCount(12);
  await expect(page.getByTestId('materials-lab-tokenization').getByText('Exercise', { exact: true })).toBeVisible();
  await expect(page.getByTestId('materials-lab-digits').getByText('Theory', { exact: true })).toBeVisible();

  await page.goto('/learn/how-ai-agent-works/materials');
  await expect(page.locator('[data-testid^="materials-lab-"]')).toHaveCount(7);
  await expect(page.getByTestId('materials-lab-agent-loop').getByText('Exercise', { exact: true })).toBeVisible();
  await expect(page.getByTestId('materials-lab-agent-evals').getByText('Theory', { exact: true })).toBeVisible();
});

test('both presentation decks and companion guides render independently', async ({ page }) => {
  await page.goto('/learn/how-llm-works/slides?slide=53');
  await expect(page.getByText('53 / 53')).toBeVisible();
  await expect(page.getByTestId('training-slides-page')).toBeVisible();

  await page.goto('/learn/how-ai-agent-works/slides?slide=33');
  await expect(page.getByText('33 / 33')).toBeVisible();
  await expect(page.getByTestId('training-slides-page')).toBeVisible();

  await page.goto('/learn/how-llm-works/guide?slide=1');
  await expect(page.getByTestId('training-guide-page')).toContainText('How LLMs Work');

  await page.goto('/learn/how-ai-agent-works/guide?slide=1');
  await expect(page.getByTestId('training-guide-page')).toContainText('Practical lens');
  await expect(page.getByTestId('training-guide-page')).not.toContainText('Mathematical lens');
});
