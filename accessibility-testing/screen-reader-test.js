const { test, expect } = require('@playwright/test')

test.describe('Screen Reader Compatibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    // Check for essential ARIA attributes
    const ariaElements = [
      '[aria-label]',
      '[aria-labelledby]',
      '[aria-describedby]',
      '[role]',
    ]
    
    for (const selector of ariaElements) {
      const elements = await page.locator(selector).all()
      
      for (const element of elements) {
        if (await element.isVisible()) {
          // Verify ARIA attributes are not empty
          const ariaLabel = await element.getAttribute('aria-label')
          const ariaLabelledby = await element.getAttribute('aria-labelledby')
          const ariaDescribedby = await element.getAttribute('aria-describedby')
          
          if (ariaLabel) {
            expect(ariaLabel.trim()).not.toBe('')
          }
          if (ariaLabelledby) {
            expect(ariaLabelledby.trim()).not.toBe('')
          }
          if (ariaDescribedby) {
            expect(ariaDescribedby.trim()).not.toBe('')
          }
        }
      }
    }
  })

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/')
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    let previousLevel = 0
    
    for (const heading of headings) {
      if (await heading.isVisible()) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
        const currentLevel = parseInt(tagName.charAt(1))
        
        // Check heading hierarchy (shouldn't skip levels)
        if (previousLevel > 0) {
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1)
        }
        
        previousLevel = currentLevel
      }
    }
  })

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/products')
    
    const images = await page.locator('img').all()
    
    for (const img of images) {
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt')
        const role = await img.getAttribute('role')
        
        // Images should have alt text or be marked as decorative
        expect(alt !== null || role === 'presentation').toBeTruthy()
        
        if (alt) {
          expect(alt.trim()).not.toBe('')
        }
      }
    }
  })

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login')
    
    const inputs = await page.locator('input, select, textarea').all()
    
    for (const input of inputs) {
      if (await input.isVisible()) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledby = await input.getAttribute('aria-labelledby')
        
        // Input should have associated label
        if (id) {
          const label = await page.locator(`label[for="${id}"]`)
          const hasLabel = await label.count() > 0
          
          expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy()
        }
      }
    }
  })

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/products')
    
    // Check for ARIA live regions
    const liveRegions = await page.locator('[aria-live]').all()
    
    for (const region of liveRegions) {
      const ariaLive = await region.getAttribute('aria-live')
      expect(['polite', 'assertive', 'off']).toContain(ariaLive)
    }
    
    // Test dynamic content updates
    await page.click('[data-testid="add-to-cart"]')
    
    // Verify cart update is announced
    const cartStatus = await page.locator('[aria-live="polite"]')
    await expect(cartStatus).toBeVisible()
  })
})