import { test, expect } from '@playwright/test';

test.describe('Profile Page Feature', () => {
  test('should allow a user to update their profile name', async ({ page }) => {
    // 1. Navegar a la página de perfil.
    // El usuario ya está logueado gracias a la configuración global.
    await page.goto('/profile');

    // 2. Definir un nuevo nombre de usuario único para la prueba
    const newName = `Test User ${Date.now()}`;

    // 3. Encontrar el campo por su etiqueta y rellenarlo
    await page.getByLabel('Nombre de Usuario:').fill(newName);

    // 4. Hacer clic en el botón de guardar
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();

    // 5. Verificar que la notificación de éxito sea visible
    await expect(page.getByText('Perfil actualizado con éxito!')).toBeVisible();

    // 6. Verificar que la cabecera de la página ahora muestra el nuevo nombre
    await expect(page.getByRole('heading', { name: newName })).toBeVisible();
  });
});
