import { ANALYTICS_CONFIG } from './config'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Initialize Google Analytics
export const initGA = () => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  
  window.gtag('js', new Date())
  window.gtag('config', ANALYTICS_CONFIG.GA4_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  })
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  
  window.gtag?.('config', ANALYTICS_CONFIG.GA4_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
  })
}

// Enhanced E-commerce tracking
export const trackPurchase = (transactionData: {
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
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  
  window.gtag?.('event', 'purchase', {
    transaction_id: transactionData.transaction_id,
    value: transactionData.value,
    currency: transactionData.currency,
    items: transactionData.items
  })
}

export const trackAddToCart = (item: {
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
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  
  window.gtag?.('event', 'add_to_cart', {
    currency: item.currency,
    value: item.value,
    items: item.items
  })
}

export const trackViewItem = (item: {
  currency: string
  value: number
  items: Array<{
    item_id: string
    item_name: string
    category: string
    price: number
  }>
}) => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  
  window.gtag?.('event', 'view_item', {
    currency: item.currency,
    value: item.value,
    items: item.items
  })
}

export const trackBeginCheckout = (item: {
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
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  
  window.gtag?.('event', 'begin_checkout', {
    currency: item.currency,
    value: item.value,
    items: item.items
  })
}

export const trackSearch = (searchTerm: string) => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  
  window.gtag?.('event', 'search', {
    search_term: searchTerm
  })
}

// Custom event tracking
export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  
  window.gtag?.('event', eventName, parameters)
}
