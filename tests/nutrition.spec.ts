import { test, expect } from '@playwright/test';

test.describe('Nutrition Page', () => {
  test('should display the nutrition page with the correct heading', async ({ page }) => {
    // The user is already logged in thanks to the global setup.
    await page.goto('/nutrition');

    // Check that the main heading is visible and has the correct text.
    await expect(page.getByRole('heading', { name: 'Tus Recomendaciones Nutricionales' })).toBeVisible();

    // Check for the food search section.
    await expect(page.getByRole('heading', { name: 'Buscador de Alimentos' })).toBeVisible();
  });
});
