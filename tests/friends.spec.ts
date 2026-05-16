import { test, expect } from '@playwright/test';

test.describe('Friends Page', () => {
  test('should display the friends page with the correct heading', async ({ page }) => {
    // The user is already logged in thanks to the global setup.
    await page.goto('/friends');

    // Check that the main heading is visible and has the correct text.
    await expect(page.getByRole('heading', { name: 'Amigos', level: 1 })).toBeVisible();

    // Check for the search input and button.
    await expect(page.getByPlaceholder('Buscar amigos por nombre de usuario...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
  });
});
