import { test, expect } from '@playwright/test'

test.describe('Shopping Flow', () => {
  test('complete purchase journey', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    await expect(page.getByText('Household Planet Kenya')).toBeVisible()

    // Browse products
    await page.click('[data-testid="products-link"]')
    await expect(page.getByText('Products')).toBeVisible()

    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child')
    await page.click('[data-testid="add-to-cart"]')
    await expect(page.getByText('Added to cart')).toBeVisible()

    // Go to cart
    await page.click('[data-testid="cart-icon"]')
    await expect(page.getByText('Shopping Cart')).toBeVisible()

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]')
    
    // Login required
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')

    // Complete checkout
    await page.fill('[data-testid="address-input"]', 'Test Address, Nairobi')
    await page.fill('[data-testid="phone-input"]', '+254700000000')
    await page.click('[data-testid="place-order"]')

    // Verify order confirmation
    await expect(page.getByText('Order Confirmed')).toBeVisible()
  })

  test('user registration flow', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('[data-testid="first-name"]', 'John')
    await page.fill('[data-testid="last-name"]', 'Doe')
    await page.fill('[data-testid="email"]', 'john@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.fill('[data-testid="confirm-password"]', 'password123')
    
    await page.click('[data-testid="register-button"]')
    
    await expect(page.getByText('Welcome')).toBeVisible()
  })
})