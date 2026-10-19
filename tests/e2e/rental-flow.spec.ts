import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('customer can rent and return a bike using only the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.clock.install({ time: new Date('2026-01-01T00:00:00.000Z') });
  await expect(
    page.getByRole('heading', { name: 'Your next ride starts here.' }),
  ).toBeVisible();

  const homeLink = page.getByRole('link', { name: 'E-bike rental home' });
  const rentButton = page.getByRole('button', { name: 'Rent this bike' });
  await homeLink.focus();
  await expect(homeLink).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(rentButton).toBeFocused();
  expect(
    await rentButton.evaluate((button) => getComputedStyle(button).outlineWidth),
  ).toBe('3px');
  await page.keyboard.press('Enter');

  await expect(page.getByText('On your ride')).toBeVisible();
  await page.clock.fastForward(60_000);
  const returnButton = page.getByRole('button', { name: 'Return this bike' });
  await returnButton.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Your receipt' })).toBeVisible();
  await expect(page.getByText('rental-001')).toBeVisible();
  await expect(page.getByText(/^€\d+\.\d{2}$/)).toBeVisible();
});

test('reload restores fresh seeded data after a completed rental', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Rent this bike' }).click();
  await page.getByRole('button', { name: 'Return this bike' }).click();
  await expect(page.getByRole('heading', { name: 'Your receipt' })).toBeVisible();

  await page.reload();

  await expect(page.getByText('Available')).toBeVisible();
  await expect(page.getByText('80%')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rent this bike' })).toBeVisible();
});

test('rental and receipt screens have no automated WCAG violations', async ({ page }) => {
  await page.goto('/');
  const landingPage = await new AxeBuilder({ page }).analyze();
  expect(landingPage.violations).toEqual([]);

  await page.getByRole('button', { name: 'Rent this bike' }).click();
  await page.getByRole('button', { name: 'Return this bike' }).click();
  const receiptPage = await new AxeBuilder({ page }).analyze();
  expect(receiptPage.violations).toEqual([]);
});

test('fits a narrow mobile viewport without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Rent this bike' })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
