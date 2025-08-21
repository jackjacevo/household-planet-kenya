'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

interface ConversionTrackingProps {
  event: 'purchase' | 'lead' | 'signup' | 'add_to_cart' | 'begin_checkout'
  data?: any
}

export function ConversionTracking({ event, data }: ConversionTrackingProps) {
  useEffect(() => {
    switch (event) {
      case 'purchase':
        if (data) analytics.purchase(data)
        break
      case 'lead':
        analytics.lead()
        break
      case 'signup':
        analytics.customEvent('sign_up')
        break
      case 'add_to_cart':
        if (data) analytics.addToCart(data)
        break
      case 'begin_checkout':
        if (data) analytics.beginCheckout(data)
        break
    }
  }, [event, data])

  return null
}