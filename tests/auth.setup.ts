import { test as setup, expect } from '@playwright/test';

// El archivo donde se guardará el estado de la sesión
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 1. Navegar a la página de login
  await page.goto('/login');

  // 2. Rellenar las credenciales
  await page
    .getByPlaceholder('Your email address')
    .fill('alexsoto042@gmail.com');
  await page.getByPlaceholder('Your password').fill('Danasofia098');

  // 3. Hacer clic en el botón de inicio de sesión (usando la opción `exact` para ser específicos)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  // 4. Esperar a que la página redirija a la página de onboarding
  await expect(page).toHaveURL('/onboarding');

  // Complete the onboarding process
  await page.getByRole('button', { name: 'Perder peso' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await page.getByRole('button', { name: 'Principiante' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await page.getByRole('button', { name: '2-3 días' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await page.getByRole('button', { name: 'Solo peso corporal' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await page.getByRole('button', { name: 'Aprender a comer sano' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await page.getByRole('button', { name: 'Masculino' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await page.getByPlaceholder('Escribe tu edad en años').fill('30');
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await page.getByLabel('Altura (cm)').fill('180');
  await page.getByLabel('Peso (kg)').fill('80');
  await page.getByRole('button', { name: 'Finalizar' }).click();

  // Wait for the navigation to the plan page to complete.
  await page.waitForURL(new RegExp('/plan/.+'));

  // 5. Guardar el estado de la sesión (cookies, local storage) en el archivo
  await page.context().storageState({ path: authFile });
});
