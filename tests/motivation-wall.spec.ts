import { test, expect } from '@playwright/test';

test.describe('Motivation Wall Page', () => {
  test('should display the motivation wall page with the correct heading', async ({ page }) => {
    // The user is already logged in thanks to the global setup.
    await page.goto('/motivation');

    // Check that the main heading is visible and has the correct text.
    await expect(page.getByRole('heading', { name: 'Muro de Motivación' })).toBeVisible();

    // Check for the "Add Video" button.
    await expect(page.locator('label.add-video-btn')).toBeVisible();
  });

  test('should allow a user to like and unlike a post', async ({ page }) => {
    await page.goto('/motivation');

    // Create a new post to test liking
    await page.locator('label.add-video-btn').click();
    await page.locator('input[type="file"]').setInputFiles('./public/images/bench-press-gvt.png'); // Upload a dummy image
    await page.getByPlaceholder('Escribe tu pie de foto aquí...').fill('Test post for likes');
    await page.getByRole('button', { name: 'Publicar' }).click();

    // Wait for the post to appear and the like count to be visible
    await expect(page.locator('.motivation-post-card')).toBeVisible();
    await expect(page.locator('.likes-count')).toHaveText('0');

    // Click the like button
    await page.locator('.like-button').first().click();

    // Verify the like count increases
    await expect(page.locator('.likes-count').first()).toHaveText('1');
    await expect(page.locator('.like-button').first()).toHaveClass(/liked/);

    // Click the like button again to unlike
    await page.locator('.like-button').first().click();

    // Verify the like count decreases
    await expect(page.locator('.likes-count').first()).toHaveText('0');
    await expect(page.locator('.like-button').first()).not.toHaveClass(/liked/);

    // Clean up: delete the created post
    await page.locator('.delete-post-btn').first().click();
    await page.once('dialog', dialog => {
      expect(dialog.message()).toContain('¿Estás seguro de que quieres eliminar esta publicación?');
      dialog.accept();
    });
    await expect(page.locator('.motivation-post-card')).not.toBeVisible();
  });
});

