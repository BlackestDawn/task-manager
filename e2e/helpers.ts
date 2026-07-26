import { expect, type Page } from '@playwright/test';

// Auto-seeded by the backend on first boot against an empty database — see
// packages/backend/src/db/seed.ts.
export const ADMIN_LOGIN = 'admin';
export const ADMIN_PASSWORD = 'admin123';

export async function loginAs(page: Page, login: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Username').fill(login);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, ADMIN_LOGIN, ADMIN_PASSWORD);
}

export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}
