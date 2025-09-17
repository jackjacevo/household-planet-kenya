'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { analytics } from '@/lib/analytics'

interface ABTest {
  id: string
  variant: 'A' | 'B'
  name: string
}

interface ABTestContextType {
  getVariant: (testId: string, testName: string) => 'A' | 'B'
  trackConversion: (testId: string, conversionType: string) => void
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined)

export function ABTestProvider({ children }: { children: ReactNode }) {
  const [tests, setTests] = useState<Map<string, ABTest>>(new Map())

  const getVariant = (testId: string, testName: string): 'A' | 'B' => {
    if (tests.has(testId)) {
      return tests.get(testId)!.variant
    }

    // Simple random assignment (50/50 split)
    const variant = Math.random() < 0.5 ? 'A' : 'B'
    const test: ABTest = { id: testId, variant, name: testName }
    
    setTests(prev => new Map(prev).set(testId, test))
    
    // Track test assignment
    analytics.customEvent('ab_test_assignment', {
      test_id: testId,
      test_name: testName,
      variant: variant
    })

    return variant
  }

  const trackConversion = (testId: string, conversionType: string) => {
    const test = tests.get(testId)
    if (test) {
      analytics.customEvent('ab_test_conversion', {
        test_id: testId,
        test_name: test.name,
        variant: test.variant,
        conversion_type: conversionType
      })
    }
  }

  return (
    <ABTestContext.Provider value={{ getVariant, trackConversion }}>
      {children}
    </ABTestContext.Provider>
  )
}

export function useABTest() {
  const context = useContext(ABTestContext)
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider')
  }
  return context
}
