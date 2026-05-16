import { test, expect } from '@playwright/test';

test.describe('Explore Plans Page', () => {
  test('should display the explore plans page with the correct heading', async ({ page }) => {
    // The user is already logged in thanks to the global setup.
    await page.goto('/explore-plans');

    // Check that the main heading is visible and has the correct text.
    await expect(page.getByRole('heading', { name: 'Explorar' })).toBeVisible();

    // Check for the section tabs.
    await expect(page.getByRole('button', { name: 'Planes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nutrición' })).toBeVisible();
  });
});
