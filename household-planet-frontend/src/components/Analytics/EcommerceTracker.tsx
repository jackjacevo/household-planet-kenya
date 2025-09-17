'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface Product {
  id: string
  name: string
  category: string
  price: number
  quantity?: number
}

interface EcommerceTrackerProps {
  event: 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'purchase'
  products: Product[]
  transactionId?: string
  currency?: string
}

export function EcommerceTracker({ 
  event, 
  products, 
  transactionId, 
  currency = 'KES' 
}: EcommerceTrackerProps) {
  const { trackViewItem, trackAddToCart, trackPurchase } = useAnalytics()

  useEffect(() => {
    const items = products.map(product => ({
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity || 1
    }))

    const value = products.reduce((sum, product) => 
      sum + (product.price * (product.quantity || 1)), 0
    )

    switch (event) {
      case 'view_item':
        trackViewItem({
          currency,
          value,
          items: items.map(({ quantity, ...item }) => item)
        })
        break

      case 'add_to_cart':
        trackAddToCart({
          currency,
          value,
          items
        })
        break

      case 'purchase':
        if (transactionId) {
          trackPurchase({
            transaction_id: transactionId,
            value,
            currency,
            items
          })
        }
        break
    }
  }, [event, products, transactionId, currency, trackViewItem, trackAddToCart, trackPurchase])

  return null
}
