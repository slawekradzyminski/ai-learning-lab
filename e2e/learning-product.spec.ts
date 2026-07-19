import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'e2e-access-token');
    localStorage.setItem('refreshToken', 'e2e-refresh-token');
  });
  await page.route('**/api/v1/users/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ username: 'e2e-user', roles: ['ROLE_CLIENT'] }),
  }));
});

const labRoutes = [
  'tokenization', 'attention', 'residual-stream', 'next-token', 'kv-cache', 'embeddings',
  'perceptron', 'gradient-descent', 'backpropagation', 'depth', 'convolution', 'digits',
  'agent-loop', 'subagents', 'context-harness', 'memory-instructions', 'hooks-lifecycle',
  'tool-boundaries', 'agent-evals',
];

test('home focuses on one course and progressively discloses every interactive lab', async ({ page }) => {
  await page.goto('/learn/');

  await expect(page.getByTestId('learning-home-title')).toBeVisible();
  await expect(page.locator('[data-testid^="learning-path-"]')).toHaveCount(19);
  await expect(page.getByTestId('learning-library')).not.toHaveAttribute('open', '');
  await page.getByTestId('learning-library-toggle').click();
  await expect(page.getByTestId('learning-library')).toHaveAttribute('open', '');
  await expect(page.locator('[data-testid^="learning-slides-"]')).toHaveCount(0);
  await expect(page.locator('[data-testid^="learning-theory-"]')).toHaveCount(0);
  await expect(page.locator('[data-testid^="learning-materials-"]')).toHaveCount(0);
  await expect(page.getByTestId('learning-canonical-llm-course')).toContainText('One question at a time');
  await expect(page.locator('[data-testid^="course-path-"]')).toHaveCount(10);
  await expect(page.getByTestId('learning-canonical-agent-course')).toContainText('Follow one goal through an agent');
  await expect(page.locator('[data-testid^="agent-course-path-"]')).toHaveCount(8);
  await expect(page.getByTestId('back-to-awesome-localstack')).toHaveAttribute('href', '/');
});

test('canonical AI Agents course keeps the runtime experiment, chapter, and checkpoint in one path', async ({ page }) => {
  await page.goto('/learn/how-ai-agent-works/course/agent-loop');

  await expect(page.getByTestId('agent-course-page')).toBeVisible();
  await expect(page.getByTestId('agent-course-pipeline')).toBeVisible();
  await expect(page.getByTestId('agent-course-lesson-title')).toContainText('LLM response become an agent run');
  await expect(page.getByTestId('agent-loop-lab-page')).toBeVisible();
  await expect(page.getByTestId('course-theory-chapter')).toContainText('Question this chapter answers');
  await expect(page.getByTestId('agent-course-forward-bridge')).toContainText('Next:');

  await page.getByTestId('agent-course-next').click();
  await expect(page).toHaveURL(/course\/subagents$/);
  await expect(page.getByTestId('subagents-lab-page')).toBeVisible();
});

test('semantic embeddings reveal an interactive 3D projection on demand', async ({ page }) => {
  await page.goto('/learn/embeddings');

  await expect(page.getByTestId('embedding-space-3d-closed')).toBeVisible();
  await expect(page.getByTestId('embedding-space-3d')).toHaveCount(0);
  await page.getByTestId('open-embedding-space-3d').click();
  await expect(page.getByTestId('embedding-space-3d')).toBeVisible();
  await expect(page.locator('[data-testid^="embedding-3d-point-"]')).toHaveCount(8);
  await page.getByTestId('embedding-3d-point-6').press('Enter');
  await expect(page.getByTestId('embedding-space-3d').getByText('A good book opens another world.', { exact: true })).toBeVisible();
});

test('canonical LLM course moves from experiment through explanation to checkpoint without duplicate modes', async ({ page }) => {
  await page.goto('/learn/how-llm-works/course/prediction-goal');

  await expect(page.getByTestId('llm-course-page')).toBeVisible();
  await expect(page.getByTestId('course-pipeline')).toBeVisible();
  await expect(page.getByTestId('course-lesson-title')).toContainText('What should follow');
  await expect(page.getByTestId('course-view-learn')).toContainText('Input');
  await expect(page.getByRole('tab')).toHaveCount(0);

  await expect(page.getByTestId('course-theory-heading')).toContainText('One small prediction');
  await expect(page.getByTestId('course-lesson-notes')).toContainText('Why this matters');
  await expect(page.getByTestId('course-lesson-notes')).toContainText('Sources and further reading');
  await expect(page.getByText('Teaching this lesson')).toHaveCount(0);
  const explanationBeforeCheckpoint = await page.locator('[data-testid="course-lesson-notes"], [data-testid="course-prediction-goal-checkpoint"]').evaluateAll(([notes, checkpoint]) => Boolean(notes.compareDocumentPosition(checkpoint) & Node.DOCUMENT_POSITION_FOLLOWING));
  expect(explanationBeforeCheckpoint).toBe(true);
  await expect(page.getByTestId('course-forward-bridge')).toContainText('Next:');

  await page.getByTestId('course-next').click();
  await expect(page).toHaveURL(/course\/tokenization$/);
  await expect(page.getByTestId('course-lesson-title')).toContainText('exact sequence');

  await page.goto('/learn/how-llm-works/course/token-embeddings');
  await expect(page.getByTestId('course-lesson-title')).toContainText('categorical ID');
  await expect(page.getByTestId('word-embedding-explorer-closed')).toContainText('real 50D vectors');
  await page.getByTestId('open-word-embedding-explorer').click();
  await expect(page.getByTestId('word-embedding-explorer')).toContainText('181 words');
  await expect(page.locator('[data-testid^="word-embedding-point-"]')).toHaveCount(181);
  await expect(page.getByTestId('embedding-vector-heatmap')).toContainText('Vector fingerprint');
  await page.getByTestId('word-mode-analogy').click();
  await expect(page.getByTestId('word-experiment-analogy')).toContainText('queen');
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
  await expect(page.locator('[data-testid^="materials-course-lesson-"]')).toHaveCount(8);
  await expect(page.getByTestId('materials-course-lesson-capstone')).toHaveAttribute('href', '/learn/how-ai-agent-works/course/capstone');
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
