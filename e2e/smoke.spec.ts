import { test, expect } from '@playwright/test';

/**
 * Smoke test — verifies the app loads and the region gate renders.
 * This is the Phase 0 "empty test" that proves CI passes.
 */
test('region gate loads and shows all three regions', async ({ page }) => {
  await page.goto('/');

  // The page should contain the Amen title
  await expect(page.locator('h1')).toContainText('AMEN');

  // All three region links should be present
  await expect(page.locator('a[href="/nairobi"]')).toBeVisible();
  await expect(page.locator('a[href="/new-york"]')).toBeVisible();
  await expect(page.locator('a[href="/paris"]')).toBeVisible();
});

test('navigating to a region loads the region shell', async ({ page }) => {
  await page.goto('/nairobi');
  await expect(page.locator('[data-region="nairobi"]').first()).toBeVisible({ timeout: 10000 });
});

test('unknown region redirects to region gate', async ({ page }) => {
  await page.goto('/london');
  // Should redirect back to /
  await expect(page).toHaveURL('/');
});
