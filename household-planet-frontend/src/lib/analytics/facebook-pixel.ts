import { ANALYTICS_CONFIG } from './config'

declare global {
  interface Window {
    fbq: (...args: any[]) => void
    _fbq: any
  }
}

export const initFacebookPixel = () => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return

  const f = window
  const b = document
  const e = 'script'
  
  if (typeof f.fbq === 'function') return;
  
  const n = f.fbq = function(...args: any[]) {
    (n as any).callMethod ? (n as any).callMethod.apply(n, args) : (n as any).queue.push(args)
  } as any
  
  if (!f._fbq) f._fbq = n
  (n as any).push = n
  n['loaded'] = true
  n['version'] = '2.0' as any
  (n as any).queue = []
  
  const t = b.createElement(e) as HTMLScriptElement
  t.async = true
  t.src = 'https://connect.facebook.net/en_US/fbevents.js'
  
  const s = b.getElementsByTagName(e)[0]
  s.parentNode?.insertBefore(t, s)
  
  window.fbq('init', ANALYTICS_CONFIG.FACEBOOK_PIXEL_ID)
  window.fbq('track', 'PageView')
}

export const trackFBPageView = () => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  window.fbq?.('track', 'PageView')
}

export const trackFBPurchase = (value: number, currency: string = 'KES') => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  window.fbq?.('track', 'Purchase', { value, currency })
}

export const trackFBAddToCart = (value: number, currency: string = 'KES') => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  window.fbq?.('track', 'AddToCart', { value, currency })
}

export const trackFBInitiateCheckout = (value: number, currency: string = 'KES') => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  window.fbq?.('track', 'InitiateCheckout', { value, currency })
}

export const trackFBViewContent = (contentType: string, contentId: string) => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  window.fbq?.('track', 'ViewContent', { content_type: contentType, content_ids: [contentId] })
}

export const trackFBSearch = (searchString: string) => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  window.fbq?.('track', 'Search', { search_string: searchString })
}

export const trackFBLead = () => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  window.fbq?.('track', 'Lead')
}
