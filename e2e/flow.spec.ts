import { expect, test } from '@playwright/test';

/**
 * One happy-path journey through the app. It is intentionally non-destructive:
 * it stops short of confirming a redemption so it can run repeatedly against a
 * seeded database. Requires the API to be running and seeded (see README).
 */
test('a member signs in, browses rewards and history, then signs out', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('customer@loyalty.test');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Dashboard
  await expect(page).toHaveURL('/');
  await expect(page.getByText('Points balance')).toBeVisible();
  await expect(page.getByText('Recent activity')).toBeVisible();

  // Rewards: open the redeem dialog, then back out without spending points.
  await page.getByRole('link', { name: 'Rewards' }).click();
  await expect(page.getByRole('heading', { name: 'Rewards' })).toBeVisible();

  await page.getByRole('button', { name: 'Redeem' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/Idempotency-Key/i)).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();

  // History
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByRole('button', { name: 'All' })).toBeVisible();

  // Sign out returns to the login screen.
  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page).toHaveURL('/login');
});
