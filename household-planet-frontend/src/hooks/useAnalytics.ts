'use client'

import { useCallback } from 'react'
import { analytics } from '@/lib/analytics'

export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    analytics.customEvent(eventName, parameters)
  }, [])

  const trackPurchase = useCallback((data: {
    transaction_id: string
    value: number
    currency: string
    items: Array<{
      item_id: string
      item_name: string
      category: string
      quantity: number
      price: number
    }>
  }) => {
    analytics.purchase(data)
  }, [])

  const trackAddToCart = useCallback((data: {
    currency: string
    value: number
    items: Array<{
      item_id: string
      item_name: string
      category: string
      quantity: number
      price: number
    }>
  }) => {
    analytics.addToCart(data)
  }, [])

  const trackViewItem = useCallback((data: {
    currency: string
    value: number
    items: Array<{
      item_id: string
      item_name: string
      category: string
      price: number
    }>
  }) => {
    analytics.viewItem(data)
  }, [])

  const trackSearch = useCallback((searchTerm: string) => {
    analytics.search(searchTerm)
  }, [])

  const trackEngagement = useCallback((action: string, category?: string) => {
    analytics.engagement(action, category)
  }, [])

  const identifyUser = useCallback((userId: string, attributes?: Record<string, any>) => {
    analytics.identifyUser(userId, attributes)
  }, [])

  return {
    trackEvent,
    trackPurchase,
    trackAddToCart,
    trackViewItem,
    trackSearch,
    trackEngagement,
    identifyUser
  }
}
