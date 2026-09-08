import { test, expect } from '@playwright/test';

test('app loads and shows the form', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'RSS Reader' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'url' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Añadir' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Feeds' })).toBeVisible();
});