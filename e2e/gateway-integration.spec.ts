import { expect, test } from '@playwright/test';

test.skip(!process.env.E2E_BASE_URL, 'Requires the Awesome LocalStack gateway test stack');

test('gateway sends an anonymous Lab visitor to the main login page', async ({ page }) => {
  await page.goto('/learn/tokenization');

  await expect(page).toHaveURL(/\/login\?returnTo=%2Flearn%2Ftokenization$/);
  await expect(page).toHaveTitle(/Awesome Testing|Vite/);
  await expect(page.getByTestId('login-submit-button')).toBeVisible();
});

test('gateway serves the standalone Lab for a validated platform session', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'gateway-access-token');
    localStorage.setItem('refreshToken', 'gateway-refresh-token');
  });
  await page.route('**/api/v1/users/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ username: 'gateway-user', roles: ['ROLE_CLIENT'] }),
  }));

  await page.goto('/learn/');
  await expect(page.getByTestId('learning-home-title')).toBeVisible();

  const returnLink = page.getByTestId('back-to-awesome-localstack');
  await expect(returnLink).toHaveAttribute('href', '/');
  await expect(returnLink).toHaveAttribute('data-navigation', 'document');
  await returnLink.click();

  await expect(page).not.toHaveURL(/\/learn/);
  await expect(page).toHaveTitle(/Awesome Testing|Vite/);

  await page.goto('/learn/tokenization');
  await expect(page.getByTestId('learning-nav-tokenization')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('h1')).toHaveText('See the pieces the model receives');
});
