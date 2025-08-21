'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analytics } from '@/lib/analytics'

const JOURNEY_STAGES = {
  '/': 'homepage',
  '/products': 'product_discovery',
  '/products/[id]': 'product_view',
  '/cart': 'cart_view',
  '/checkout': 'checkout_start',
  '/checkout/payment': 'payment_info',
  '/checkout/success': 'purchase_complete',
  '/login': 'authentication',
  '/register': 'registration',
  '/profile': 'account_management'
}

export function CustomerJourneyTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const stage = getJourneyStage(pathname)
    if (stage) {
      analytics.customEvent('customer_journey_stage', {
        stage: stage,
        page_path: pathname,
        timestamp: new Date().toISOString()
      })
    }
  }, [pathname])

  return null
}

function getJourneyStage(pathname: string): string | null {
  // Direct match
  if (JOURNEY_STAGES[pathname as keyof typeof JOURNEY_STAGES]) {
    return JOURNEY_STAGES[pathname as keyof typeof JOURNEY_STAGES]
  }

  // Pattern matching
  if (pathname.startsWith('/products/') && pathname !== '/products') {
    return 'product_view'
  }
  
  if (pathname.startsWith('/category/')) {
    return 'category_browse'
  }
  
  if (pathname.includes('/search')) {
    return 'search_results'
  }

  return null
}