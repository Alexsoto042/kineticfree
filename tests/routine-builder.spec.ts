import { test, expect } from '@playwright/test';

// Este test asume que los ejercicios 'Squat' y 'Push-up' existen en la base de datos
// y que las tarjetas de ejercicio tienen un `data-testid` con el formato `exercise-card-{nombre-ejercicio}`.

test.describe('Routine Builder Feature', () => {
  // Usamos el estado de autenticación guardado para no tener que iniciar sesión en cada test.
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should allow a user to create, save, and view a new routine', async ({
    page,
  }) => {
    // 1. Navegar a la página de creación de rutinas
    await page.goto('/build-routine');
    await page.waitForLoadState('networkidle'); // Wait for the page to be fully loaded

    // 2. Verificar que el encabezado principal está visible
    await expect(
      page.getByRole('heading', { name: 'Crear Nueva Rutina' })
    ).toBeVisible();

    // 3. Rellenar el nombre de la rutina con un nombre único para evitar colisiones
    const routineName = `Mi Rutina de Prueba - ${Date.now()}`;
    await page.getByLabel('Nombre de la Rutina:').fill(routineName);

    // 4. Añadir dos ejercicios de la lista a la rutina
    // Usamos `getByText` para encontrar el ejercicio y luego localizamos el botón 'Añadir' relativo a él.
    await page
      .getByText('Squat')
      .locator('..')
      .getByRole('button', { name: 'Añadir' })
      .click();
    await page
      .getByText('Push-up')
      .locator('..')
      .getByRole('button', { name: 'Añadir' })
      .click();

    // 5. Verificar que los ejercicios se han añadido a la lista de la rutina actual
    // Asumimos que los ejercicios en la rutina tienen un `data-testid` con el formato `routine-exercise-{nombre}`
    await expect(page.getByTestId('routine-exercise-squat')).toBeVisible();
    await expect(page.getByTestId('routine-exercise-push-up')).toBeVisible();

    // 6. Guardar la rutina
    await page.getByRole('button', { name: 'Guardar Rutina' }).click();

    // 7. Verificar que se muestra el mensaje de éxito (toast)
    await expect(page.getByText('Rutina guardada con éxito')).toBeVisible();

    // 8. Verificar la redirección a la página de la lista de rutinas
    await expect(page).toHaveURL(/.*\/routines/);

    // 9. Verificar que la nueva rutina aparece en la lista de rutinas
    await expect(
      page.getByRole('heading', { name: routineName })
    ).toBeVisible();
  });
});
