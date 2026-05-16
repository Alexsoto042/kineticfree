import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  // By using a new context, we are not using the global setup for authentication.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should display the login page with the correct heading', async ({ page }) => {
    await page.goto('/login');

    // Check that the main heading is visible and has the correct text.
    await expect(page.getByRole('heading', { name: 'Kinetic' })).toBeVisible();
    await expect(page.getByText('Bienvenido, por favor inicia sesión para continuar')).toBeVisible();
  });
});
