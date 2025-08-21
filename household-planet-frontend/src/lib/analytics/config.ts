export const ANALYTICS_CONFIG = {
  // Google Analytics 4
  GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  
  // Google Tag Manager
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX',
  
  // Facebook Pixel
  FACEBOOK_PIXEL_ID: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '000000000000000',
  
  // Hotjar
  HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID || '0000000',
  HOTJAR_VERSION: process.env.NEXT_PUBLIC_HOTJAR_VERSION || '6',
  
  // Environment
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Enhanced E-commerce Events
  ECOMMERCE_EVENTS: {
    VIEW_ITEM: 'view_item',
    ADD_TO_CART: 'add_to_cart',
    REMOVE_FROM_CART: 'remove_from_cart',
    VIEW_CART: 'view_cart',
    BEGIN_CHECKOUT: 'begin_checkout',
    ADD_PAYMENT_INFO: 'add_payment_info',
    PURCHASE: 'purchase',
    REFUND: 'refund',
    VIEW_ITEM_LIST: 'view_item_list',
    SELECT_ITEM: 'select_item',
    ADD_TO_WISHLIST: 'add_to_wishlist',
    SEARCH: 'search'
  },
  
  // Custom Events
  CUSTOM_EVENTS: {
    USER_ENGAGEMENT: 'user_engagement',
    SCROLL_DEPTH: 'scroll_depth',
    FILE_DOWNLOAD: 'file_download',
    OUTBOUND_CLICK: 'outbound_click',
    VIDEO_PLAY: 'video_play',
    FORM_SUBMIT: 'form_submit',
    NEWSLETTER_SIGNUP: 'newsletter_signup',
    LIVE_CHAT_START: 'live_chat_start',
    WHATSAPP_CLICK: 'whatsapp_click',
    PHONE_CALL: 'phone_call'
  }
}

export type AnalyticsEvent = keyof typeof ANALYTICS_CONFIG.ECOMMERCE_EVENTS | keyof typeof ANALYTICS_CONFIG.CUSTOM_EVENTS