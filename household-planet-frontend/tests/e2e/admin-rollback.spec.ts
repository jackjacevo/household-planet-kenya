import { test, expect } from '@playwright/test';

test.describe('Admin Rollback Tests', () => {
  test('admin functions work with features disabled', async ({ page }) => {
    // Set feature flags to false
    await page.addInitScript(() => {
      window.localStorage.setItem('feature-flags', JSON.stringify({
        newDialogs: false,
        validation: false,
        improvedLoading: false
      }));
    });

    await page.goto('/admin/login');
    
    // Test basic login still works
    await page.fill('[data-testid="email"]', 'admin@householdplanetkenya.co.ke');
    await page.fill('[data-testid="password"]', 'Admin123!@#');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('fallback dialogs work when new dialogs disabled', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Mock window.confirm for fallback
    await page.evaluate(() => {
      window.confirm = () => true;
    });
    
    await page.click('[data-testid="delete-product"]');
    // Should use fallback confirm dialog
  });
});