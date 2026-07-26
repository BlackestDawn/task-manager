import { test, expect } from '@playwright/test';
import { ADMIN_LOGIN, ADMIN_PASSWORD, loginAsAdmin } from './helpers';

test('redirects an unauthenticated visitor away from a protected page, back to it after login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?redirect=\/dashboard/);

  await page.getByLabel('Username').fill(ADMIN_LOGIN);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
});

test('shows an error and stays on the login page for the wrong password', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill(ADMIN_LOGIN);
  await page.getByLabel('Password').fill('definitely-wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('logs out and can no longer reach a protected page', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByRole('button', { name: /logout/i }).first().click();

  await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
