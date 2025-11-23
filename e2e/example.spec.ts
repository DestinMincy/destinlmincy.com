import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Destin L. Mincy/);
});

test('has main heading', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Expects page to have a heading with the name.
    await expect(page.getByRole('heading', { name: 'Destin L. Mincy' })).toBeVisible();
});

test('design system loads', async ({ page }) => {
    await page.goto('http://localhost:3000/design-system');

    await expect(page.getByRole('heading', { name: 'Design System' })).toBeVisible();
});
