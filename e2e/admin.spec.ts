import { test, expect } from '@playwright/test';

test('admin login flow', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // 1. Navigate to admin page (should redirect to login)
    await page.goto('http://localhost:3000/admin');
    await expect(page).toHaveURL('http://localhost:3000/login?callbackUrl=%2Fadmin');

    // 2. Fill in credentials
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');

    // 3. Submit form
    await page.click('button[type="submit"]');

    // Debug cookies
    const cookies = await page.context().cookies();
    console.log('Cookies after login:', cookies);

    // 4. Should redirect back to admin dashboard
    await expect(page).toHaveURL('http://localhost:3000/admin');
    await expect(page.getByRole('heading', { name: 'Welcome, Destin Mincy' })).toBeVisible();
});

test('admin projects CRUD navigation', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000/admin');

    // Navigate to projects list
    await page.goto('http://localhost:3000/admin/projects');
    await expect(page.getByRole('table')).toBeVisible();

    // Navigate to create page
    await page.goto('http://localhost:3000/admin/projects/create');
    await expect(page.getByLabel('Title')).toBeVisible();
});
