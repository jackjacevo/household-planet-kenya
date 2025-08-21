import { initGA, trackPageView, trackPurchase, trackAddToCart, trackViewItem, trackBeginCheckout, trackSearch, trackCustomEvent } from './gtag'
import { initFacebookPixel, trackFBPageView, trackFBPurchase, trackFBAddToCart, trackFBInitiateCheckout, trackFBViewContent, trackFBSearch, trackFBLead } from './facebook-pixel'
import { initHotjar, identifyHotjarUser, triggerHotjarEvent, addHotjarTags } from './hotjar'
import { ANALYTICS_CONFIG } from './config'

// Initialize all analytics services
export const initAnalytics = () => {
  initGA()
  initFacebookPixel()
  initHotjar()
}

// Unified tracking interface
export const analytics = {
  // Page tracking
  pageView: (url: string, title?: string) => {
    trackPageView(url, title)
    trackFBPageView()
  },

  // E-commerce tracking
  purchase: (data: {
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
    trackPurchase(data)
    trackFBPurchase(data.value, data.currency)
  },

  addToCart: (data: {
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
    trackAddToCart(data)
    trackFBAddToCart(data.value, data.currency)
  },

  viewItem: (data: {
    currency: string
    value: number
    items: Array<{
      item_id: string
      item_name: string
      category: string
      price: number
    }>
  }) => {
    trackViewItem(data)
    trackFBViewContent('product', data.items[0]?.item_id)
  },

  beginCheckout: (data: {
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
    trackBeginCheckout(data)
    trackFBInitiateCheckout(data.value, data.currency)
  },

  search: (searchTerm: string) => {
    trackSearch(searchTerm)
    trackFBSearch(searchTerm)
  },

  // Custom events
  customEvent: (eventName: string, parameters?: Record<string, any>) => {
    trackCustomEvent(eventName, parameters)
    triggerHotjarEvent(eventName)
  },

  // User identification
  identifyUser: (userId: string, attributes?: Record<string, any>) => {
    identifyHotjarUser(userId, attributes)
  },

  // Lead tracking
  lead: () => {
    trackFBLead()
    triggerHotjarEvent('lead_generated')
  },

  // Engagement tracking
  engagement: (action: string, category?: string) => {
    trackCustomEvent('user_engagement', {
      engagement_action: action,
      engagement_category: category
    })
  }
}

export * from './config'