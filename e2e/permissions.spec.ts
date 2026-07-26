import { test, expect } from '@playwright/test';
import { loginAs, loginAsAdmin, uniqueName } from './helpers';

test('a plain user cannot see admin-only creation controls', async ({ page }) => {
  const login = `e2euser${Date.now()}`;
  const password = 'e2e-password-123';

  await test.step('admin creates a plain "user"-role account', async () => {
    await loginAsAdmin(page);
    await page.goto('/users');
    await page.getByRole('button', { name: /add user/i }).click();

    await page.getByLabel('Login').fill(login);
    await page.getByLabel('Full Name').fill(uniqueName('E2E Plain User'));
    await page.getByLabel('Password').fill(password);
    await page.getByLabel(/access level/i).selectOption('user');
    await page.getByRole('button', { name: /create user/i }).click();

    await expect(page.getByRole('button', { name: /add user/i })).toBeVisible();

    await page.getByRole('button', { name: /logout/i }).first().click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  });

  await test.step('the plain user does not see group/user creation controls', async () => {
    await loginAs(page, login, password);

    await page.goto('/groups');
    await expect(page.getByRole('button', { name: /create group/i })).toHaveCount(0);

    await page.goto('/users');
    await expect(page.getByRole('button', { name: /add user/i })).toHaveCount(0);
  });
});
