import { test, expect } from '@playwright/test';
import { loginAsAdmin, uniqueName } from './helpers';

test('creates a task, sees it on the dashboard, and marks it done', async ({ page }) => {
  await loginAsAdmin(page);
  const title = uniqueName('E2E Task');

  await test.step('create a task with no due date from the calendar page', async () => {
    await page.goto('/tasks');
    await page.getByRole('button', { name: 'Create Task' }).click();

    const dialogForm = page.locator('form');
    await dialogForm.getByLabel(/title/i).fill(title);
    await dialogForm.getByRole('button', { name: 'Create Task' }).click();

    await expect(dialogForm.getByLabel(/title/i)).not.toBeVisible();
  });

  await test.step('see the task under "No Time Limit" on the dashboard', async () => {
    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: title })).toBeVisible();
  });

  await test.step('mark the task as completed', async () => {
    await page.getByRole('link', { name: title }).click();
    await expect(page).toHaveURL(/\/tasks\//);

    await page.getByRole('button', { name: /change status/i }).click();
    // Unlike the user-status toggle, clicking this switch submits
    // immediately (see taskStatusSection.tsx's handleToggleStatus) — there
    // is no separate confirm/submit button, just a "Done" cancel button.
    await page.getByRole('switch').click();

    await expect(page.getByText('Task Completed')).toBeVisible();
  });
});
