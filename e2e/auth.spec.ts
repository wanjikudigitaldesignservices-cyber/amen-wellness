import { test, expect } from '@playwright/test';

test.describe('Admin Authentication & RBAC (Phase 2)', () => {
  test('unauthenticated visit to /admin redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1')).toContainText('AMEN');
    await expect(page.locator('text=ADMINISTRATION PORTAL')).toBeVisible();
  });

  test('invalid login credentials show failure message and remaining attempts', async ({
    page,
  }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    await page.fill('#email', 'invalid.user@amenwellness.com');
    await page.fill('#password', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('attempts remaining');
  });

  test('successful step-1 login routes to mandatory two-step verification (MFA)', async ({
    page,
  }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    // Use Nairobi Admin demo button
    await page.click('text=Nairobi Admin');
    await expect(page.locator('#email')).toHaveValue('nairobi.admin@amenwellness.com');

    await page.click('button[type="submit"]');

    // Should navigate to MFA
    await expect(page).toHaveURL(/\/admin\/mfa/);
    await expect(page.locator('h1')).toContainText('Two-Step Verification');
    await expect(page.locator('text=nairobi.admin@amenwellness.com')).toBeVisible();
    await expect(page.locator('text=REGION_ADMIN')).toBeVisible();
  });

  test('entering valid MFA code completes login and accesses locked regional dashboard', async ({
    page,
  }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    // Fill Nairobi Admin
    await page.click('text=Nairobi Admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/mfa/);

    // Enter 6-digit TOTP code
    await page.fill('#totp-code', '123456');
    await page.click('button[type="submit"]');

    // Should land on Admin Dashboard
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h1')).toContainText('Amen Nairobi Administration');
    await expect(page.locator('text=Region Locked: Nairobi')).toBeVisible();
    await expect(page.locator('text=Zero-Trust RLS Active · MFA Verified')).toBeVisible();

    // Verify Sign Out
    await page.click('text=Sign Out');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('super admin dashboard includes region switcher', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    // Fill Super Admin
    await page.click('text=Super Admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/mfa/);

    // Enter 6-digit TOTP code
    await page.fill('#totp-code', '123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin/);
    // Super admin has region switcher dropdown
    const regionSelect = page.locator('select');
    await expect(regionSelect).toBeVisible();
    await expect(regionSelect).toHaveValue('nairobi');

    // Switch to Paris
    await regionSelect.selectOption('paris');
    await expect(page.locator('h1')).toContainText('Amen Paris Administration');
  });
});
