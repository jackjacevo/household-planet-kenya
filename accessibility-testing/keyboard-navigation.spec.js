const { test, expect } = require('@playwright/test')

test.describe('Keyboard Navigation', () => {
  test('should navigate homepage with keyboard only', async ({ page }) => {
    await page.goto('/')
    
    // Test Tab navigation
    await page.keyboard.press('Tab')
    let focused = await page.locator(':focus')
    await expect(focused).toBeVisible()
    
    // Navigate through main menu
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Verify navigation worked
    await expect(page).toHaveURL(/products/)
  })

  test('should access all interactive elements', async ({ page }) => {
    await page.goto('/products')
    
    const interactiveElements = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      '[tabindex="0"]'
    ]
    
    for (const selector of interactiveElements) {
      const elements = await page.locator(selector).all()
      
      for (const element of elements) {
        if (await element.isVisible()) {
          await element.focus()
          
          // Verify focus is visible
          const focusedElement = await page.locator(':focus')
          await expect(focusedElement).toBeVisible()
        }
      }
    }
  })

  test('should handle form navigation', async ({ page }) => {
    await page.goto('/login')
    
    // Tab through form fields
    await page.keyboard.press('Tab') // Email field
    await page.keyboard.type('test@example.com')
    
    await page.keyboard.press('Tab') // Password field
    await page.keyboard.type('password123')
    
    await page.keyboard.press('Tab') // Submit button
    await page.keyboard.press('Enter')
    
    // Verify form submission
    await expect(page.locator('.error, .success')).toBeVisible()
  })

  test('should support skip links', async ({ page }) => {
    await page.goto('/')
    
    // Press Tab to focus skip link
    await page.keyboard.press('Tab')
    const skipLink = await page.locator(':focus')
    
    if (await skipLink.textContent() === 'Skip to main content') {
      await page.keyboard.press('Enter')
      
      // Verify focus moved to main content
      const mainContent = await page.locator(':focus')
      await expect(mainContent).toHaveAttribute('id', 'main-content')
    }
  })
})