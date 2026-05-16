import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should display the dashboard with the correct heading', async ({ page }) => {
    // The user is already logged in thanks to the global setup.
    await page.goto('/');

    // Check that the main heading is visible and has the correct text.
    await expect(page.getByRole('heading', { name: 'Tu Panel' })).toBeVisible();

    // You can add more assertions here to check for other elements on the dashboard.
    // For example, check for the presence of the stats grid.
    await expect(page.getByRole('heading', { name: 'Actividad Reciente' }).first()).toBeVisible();
  });
});
