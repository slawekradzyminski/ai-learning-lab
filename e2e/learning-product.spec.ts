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
  await page.route('**/api/v1/learning/gpt2/status', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      available: process.env.E2E_EXPECT_LIVE_RUNTIME === '1',
      mode: 'full-local',
      message: 'E2E capability fixture',
      modelLabel: 'openai-community/gpt2',
      modelRevision: '607a30d7',
      layerCount: 12,
      headCount: 12,
      maxTokens: 32,
    }),
  }));
});

const labRoutes = [
  'tokenization', 'attention', 'residual-stream', 'next-token', 'kv-cache', 'embeddings',
  'perceptron', 'gradient-descent', 'backpropagation', 'depth', 'convolution', 'digits',
  'agent-loop', 'subagents', 'context-harness', 'memory-instructions', 'hooks-lifecycle',
  'tool-boundaries', 'agent-evals',
];
const expectLiveRuntime = process.env.E2E_EXPECT_LIVE_RUNTIME === '1';

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
  await expect(page.getByTestId('agent-course-lesson-menu')).toBeVisible();
  await expect(page.getByTestId('agent-course-pipeline')).toHaveCount(0);
  await page.getByTestId('agent-course-lesson-menu').locator('summary').click();
  await expect(page.getByTestId('agent-course-lesson-menu')).toHaveAttribute('open', '');
  await expect(page.getByTestId('agent-course-lesson-menu').getByRole('link')).toHaveCount(8);
  await page.getByTestId('agent-course-lesson-menu').locator('summary').click();
  await expect(page.getByTestId('agent-course-representation-contract')).toHaveCount(0);
  await expect(page.getByTestId('agent-course-lesson-title')).toContainText('LLM response become an agent run');
  await expect(page.getByRole('navigation', { name: 'Lesson materials' }).getByRole('link')).toHaveCount(4);
  await expect(page.getByTestId('agent-loop-lab-page')).toBeVisible();
  await expect(page.getByTestId('lesson-mechanism')).toBeVisible();
  await expect(page.getByTestId('lesson-prediction')).toHaveCount(0);
  await expect(page.getByTestId('lesson-debrief')).toHaveCount(0);
  await expect(page.getByTestId('experiment-evidence-source')).toContainText('Deterministic browser simulation');
  await expect(page.getByTestId('course-theory-chapter')).toHaveCount(0);
  await expect(page.getByTestId('agent-course-forward-bridge')).toContainText('Next:');

  await page.getByTestId('agent-course-next').click();
  await expect(page).toHaveURL(/course\/subagents$/);
  await expect(page.getByTestId('subagents-lab-page')).toBeVisible();
});

test('release exposes live controls only when its backend capabilities are enabled', async ({ page }) => {
  await page.goto('/learn/next-token');
  await expect(page.getByRole('button', { name: 'Offline example' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Live model' })).toHaveCount(expectLiveRuntime ? 1 : 0);

  await page.goto('/learn/embeddings');
  await expect(page.getByTestId('embeddings-mode-guided')).toBeVisible();
  await expect(page.getByTestId('embeddings-mode-live')).toHaveCount(expectLiveRuntime ? 1 : 0);

  await page.goto('/learn/tokenization');
  await page.getByTestId('tokenization-mode-bonsai').click();
  await expect(page.getByTestId('tokenization-source')).toContainText('Qwen3.6 tokenizer used by Bonsai 27B');
  await expect(page.getByTestId('tokenization-verification')).toHaveCount(expectLiveRuntime ? 1 : 0);
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
  await expect(page.getByTestId('course-lesson-menu')).toBeVisible();
  await expect(page.getByTestId('course-pipeline')).toHaveCount(0);
  await page.getByTestId('course-lesson-menu').locator('summary').click();
  await expect(page.getByTestId('course-lesson-menu')).toHaveAttribute('open', '');
  await expect(page.getByTestId('course-lesson-menu').getByRole('link')).toHaveCount(10);
  await page.getByTestId('course-lesson-menu').locator('summary').click();
  await expect(page.getByTestId('course-lesson-title')).toContainText('What should follow');
  await expect(page.getByRole('navigation', { name: 'Lesson materials' }).getByRole('link')).toHaveCount(4);
  await expect(page.getByTestId('course-representation-contract')).toHaveCount(0);
  await expect(page.getByTestId('llm-trace-ledger')).toHaveCount(0);
  await expect(page.getByRole('tab')).toHaveCount(0);
  await expect(page.getByTestId('course-scenario')).toContainText('Unfinished prompt');
  await expect(page.getByTestId('lesson-mechanism')).toContainText('One small prediction');
  await expect(page.getByTestId('experiment-evidence-source')).toContainText('Choose an evidence lane');
  await expect(page.getByTestId('prediction-source-switch')).toContainText('Teaching model');
  await expect(page.getByTestId('prediction-source-switch')).toContainText('GPT-2');
  await expect(page.getByTestId('prediction-source-switch')).toContainText('Bonsai');
  await expect(page.getByTestId('course-theory-chapter')).toHaveCount(0);

  await expect(page.getByTestId('lesson-prediction')).toHaveCount(0);
  await expect(page.getByTestId('lesson-debrief')).toHaveCount(0);
  const orderIsCorrect = await page.locator('[data-testid="lesson-mechanism"], [data-testid="lesson-experiment-heading"], [data-testid="course-prediction-activity"], [data-testid="course-prediction-goal-checkpoint"], [data-testid="course-lesson-notes"]').evaluateAll((elements) => elements.every((element, index) => index === elements.length - 1 || Boolean(element.compareDocumentPosition(elements[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING)));
  expect(orderIsCorrect).toBe(true);
  const pacing = await page.getByTestId('mandatory-lesson-spine').evaluate((element) => ({ words: (element.textContent ?? '').trim().split(/\s+/).length, screenHeights: element.getBoundingClientRect().height / window.innerHeight }));
  expect(pacing.words).toBeLessThan(1500);
  expect(pacing.screenHeights).toBeLessThan(15);

  await page.getByText('Deep dive / reference chapter').click();
  await expect(page.getByTestId('course-theory-chapter')).toContainText('Question this chapter answers');
  await expect(page.getByTestId('course-forward-bridge')).toContainText('Next:');

  await page.getByTestId('course-next').click();
  await expect(page).toHaveURL(/course\/tokenization$/);
  await expect(page.getByTestId('course-lesson-title')).toContainText('exact sequence');
  await expect(page.getByTestId('course-scenario')).toContainText('Unfinished prompt');
  await expect(page.getByTestId('course-scenario')).not.toContainText('tired');

  await page.goto('/learn/how-llm-works/course/token-embeddings');
  await expect(page.getByTestId('course-lesson-title')).toContainText('categorical ID');
  await expect(page.getByTestId('word-embedding-explorer-closed')).toContainText('real 50D vectors');
  await page.getByTestId('open-word-embedding-explorer').click();
  await expect(page.getByTestId('word-embedding-explorer')).toContainText('181 words');
  await expect(page.locator('[data-testid^="word-embedding-point-"]')).toHaveCount(11);
  await page.getByTestId('toggle-glove-embedding-space').click();
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

test('complete materials indexes expose every lab and integrated lesson handoff', async ({ page }) => {
  await page.goto('/learn/how-llm-works/materials');
  await expect(page.locator('[data-testid^="materials-lab-"]')).toHaveCount(12);
  await expect(page.getByTestId('materials-lab-tokenization').getByText('Interactive lab', { exact: true })).toBeVisible();
  await expect(page.getByTestId('materials-lab-tokenization').getByText('Integrated lesson', { exact: true })).toBeVisible();
  await expect(page.getByTestId('materials-lab-digits').getByText('Interactive lab', { exact: true })).toBeVisible();

  await page.goto('/learn/how-ai-agent-works/materials');
  await expect(page.locator('[data-testid^="materials-lab-"]')).toHaveCount(7);
  await expect(page.locator('[data-testid^="materials-course-lesson-"]')).toHaveCount(8);
  await expect(page.getByTestId('materials-course-lesson-capstone')).toHaveAttribute('href', '/learn/how-ai-agent-works/course/capstone');
  await expect(page.getByTestId('materials-lab-agent-loop').getByText('Interactive lab', { exact: true })).toBeVisible();
  await expect(page.getByTestId('materials-lab-agent-evals').getByText('Integrated lesson', { exact: true })).toBeVisible();
});

test('retired presentation and guide routes return to the learning home', async ({ page }) => {
  await page.goto('/learn/how-llm-works/slides?slide=53');
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByTestId('learning-home-title')).toBeVisible();

  await page.goto('/learn/how-ai-agent-works/slides?slide=33');
  await expect(page).toHaveURL(/\/learn$/);

  await page.goto('/learn/how-llm-works/guide?slide=1');
  await expect(page).toHaveURL(/\/learn$/);

  await page.goto('/learn/how-ai-agent-works/guide?slide=26');
  await expect(page).toHaveURL(/\/learn$/);
});
