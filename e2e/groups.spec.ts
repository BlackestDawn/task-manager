import { test, expect } from '@playwright/test';
import { loginAsAdmin, uniqueName } from './helpers';

test('creates a group, adds a member, and assigns a task to it', async ({ page }) => {
  await loginAsAdmin(page);
  const groupName = uniqueName('E2E Group');
  const taskTitle = uniqueName('E2E Assignable Task');

  await test.step('create a group', async () => {
    await page.goto('/groups');
    await page.getByRole('button', { name: /create group/i }).click();
    await page.getByLabel('Group Name').fill(groupName);
    await page.getByRole('button', { name: /create group/i }).last().click();

    await expect(page.getByRole('link', { name: groupName })).toBeVisible();
    await page.getByRole('link', { name: groupName }).click();
  });

  await test.step('add the admin account as a member', async () => {
    await page.getByRole('button', { name: /members \(0\)/i }).click();
    await page.getByRole('button', { name: /add members/i }).click(); // empty-state trigger, enters edit mode
    await page.getByRole('button', { name: /^add member$/i }).click(); // reveals the select form
    const userSelect = page.getByLabel(/select user/i);
    const adminOptionValue = await userSelect.locator('option', { hasText: 'Administrator' }).getAttribute('value');
    await userSelect.selectOption(adminOptionValue!);
    await page.getByRole('button', { name: /add to group/i }).click();

    await expect(page.getByText('Administrator')).toBeVisible();
  });

  await test.step('create a task to assign', async () => {
    await page.goto('/tasks');
    await page.getByRole('button', { name: 'Create Task' }).click();
    const dialogForm = page.locator('form');
    await dialogForm.getByLabel(/title/i).fill(taskTitle);
    await dialogForm.getByRole('button', { name: 'Create Task' }).click();
    await expect(dialogForm.getByLabel(/title/i)).not.toBeVisible();
  });

  await test.step('assign the task to the group', async () => {
    await page.goto('/groups');
    await page.getByRole('link', { name: groupName }).click();
    await page.getByRole('button', { name: /tasks \(0\)/i }).click();
    await page.getByRole('button', { name: /assign tasks/i }).click(); // empty-state trigger, enters edit mode
    await page.getByRole('button', { name: /^assign task$/i }).click(); // reveals the select form
    const taskSelect = page.getByLabel(/select task/i);
    const taskOptionValue = await taskSelect.locator('option', { hasText: taskTitle }).getAttribute('value');
    await taskSelect.selectOption(taskOptionValue!);
    await page.getByRole('button', { name: /assign to group/i }).click();

    // Assigning a task does a full page reload (see groupTasksListSection.tsx),
    // which lands back on the default "Overview" tab.
    await expect(page).toHaveURL(/\/groups\//);
    await page.getByRole('button', { name: /tasks \(1\)/i }).click();
    await expect(page.getByText(taskTitle)).toBeVisible();
  });
});
