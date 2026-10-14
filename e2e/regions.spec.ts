import { test, expect } from '@playwright/test';

test.describe('Multi-Region Distinctness & Features', () => {
  test('Nairobi displays distinct programs, team, hotline, and currency', async ({ page }) => {
    await page.goto('/nairobi');

    // Nairobi region shell rendered
    await expect(page.locator('[data-region="nairobi"]')).toBeVisible();

    // Verify Nairobi city and currency
    await expect(page.getByText('Nairobi Sanctuary').first()).toBeVisible();
    await expect(page.getByText('KES').first()).toBeVisible();

    // Verify distinct Nairobi hotline
    await expect(page.getByText('+254 709 555 100').first()).toBeVisible();

    // Verify distinct Nairobi clinical team
    await expect(page.getByText('Dr. Amani Kamau')).toBeVisible();
    await expect(page.getByText('Juma Kiprop')).toBeVisible();

    // Verify distinct Nairobi programs
    await expect(page.getByText('Highland Botanical Deep Heat & Tissue Revival')).toBeVisible();
    await expect(page.getByText('Garden Hydrotherapy & Thermal Plunge Circuit')).toBeVisible();
  });

  test('New York displays distinct programs, team, hotline, and currency', async ({ page }) => {
    await page.goto('/new-york');

    // New York region shell rendered
    await expect(page.locator('[data-region="new-york"]')).toBeVisible();

    // Verify New York city and currency
    await expect(page.getByText('New York Sanctuary').first()).toBeVisible();
    await expect(page.getByText('USD').first()).toBeVisible();

    // Verify distinct New York hotline
    await expect(page.getByText('+1 (212) 899-7400').first()).toBeVisible();

    // Verify distinct New York clinical team
    await expect(page.getByText('Marcus Sterling, DPT')).toBeVisible();
    await expect(page.getByText('Tyler Brooks, LMT')).toBeVisible();

    // Verify distinct New York programs
    await expect(page.getByText('Sub-Zero Cryo & Infrared Contrast Protocol')).toBeVisible();
    await expect(page.getByText('Zero-Gravity Magnesium Sensory Float Suite')).toBeVisible();
  });

  test('Paris displays distinct programs, team, hotline, and currency', async ({ page }) => {
    await page.goto('/paris');

    // Paris region shell rendered
    await expect(page.locator('[data-region="paris"]')).toBeVisible();

    // Verify Paris city and currency
    await expect(page.getByText('Paris Sanctuary').first()).toBeVisible();
    await expect(page.getByText('EUR').first()).toBeVisible();

    // Verify distinct Paris hotline
    await expect(page.getByText('+33 1 42 68 90 20').first()).toBeVisible();

    // Verify distinct Paris clinical team
    await expect(page.getByText('Julien Moreau')).toBeVisible();
    await expect(page.getByText('Mathieu Laurent')).toBeVisible();

    // Verify distinct Paris programs
    await expect(page.getByText('Rituel Hammam & Gommage Traditionnel Homme')).toBeVisible();
    await expect(page.getByText('Massage Signature Récupération Profonde & Fascias')).toBeVisible();
  });

  test('Interactive booking reservation modal works smoothly', async ({ page }) => {
    await page.goto('/nairobi');

    // Click Reserve Session on first program
    const reserveBtn = page.getByRole('button', { name: /Reserve Session/i }).first();
    await reserveBtn.click();

    // Modal should be visible
    await expect(page.getByText('Reserve Recovery Session')).toBeVisible();

    // Fill in guest form
    await page.fill('input[type="date"]', '2026-11-15');
    await page.fill('input[placeholder*="David Mwangi"]', 'John Mutiso');
    await page.fill('input[placeholder*="+254"]', '+254711223344');

    // Submit reservation
    await page.getByRole('button', { name: 'Confirm Reservation' }).click();

    // Success screen with reference number
    await expect(page.getByText('Reservation Confirmed')).toBeVisible();
    await expect(page.getByText(/AMN-NAI-/)).toBeVisible();
  });
});
