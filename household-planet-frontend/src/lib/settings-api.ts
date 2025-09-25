import axios from 'axios'

const API_BASE_URL = ''

export interface Setting {
  value: any
  type?: string
  description?: string
}

export interface CompanySettings {
  siteName?: string
  siteDescription?: string
  companyName?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  businessHours?: string
  timezone?: string
  currency?: string
  language?: string
}

export interface InventorySettings {
  lowStockThreshold?: number
  trackStock?: boolean
  autoApproveReviews?: boolean
  allowBackorders?: boolean
  showOutOfStock?: boolean
  maxOrderQuantity?: number
  requireStockConfirmation?: boolean
}

export interface NotificationSettings {
  emailNotifications?: boolean
  smsNotifications?: boolean
  whatsappNotifications?: boolean
  orderConfirmationEmail?: boolean
  orderStatusUpdates?: boolean
  lowStockAlerts?: boolean
  newCustomerNotifications?: boolean
  dailySalesReport?: boolean
  notificationEmail?: string
}

export interface PaymentSettings {
  taxRate?: number
  shippingFee?: number
  freeShippingThreshold?: number
  mpesaShortcode?: string
  mpesaPaybill?: string
  mpesaAccount?: string
  mpesaPasskey?: string
  mpesaConsumerKey?: string
  mpesaConsumerSecret?: string
  enableCashPayments?: boolean
  enableBankTransfer?: boolean
  bankAccountDetails?: string
}

export interface SecuritySettings {
  sessionTimeout?: number
  maxLoginAttempts?: number
  lockoutDuration?: number
  requireTwoFactor?: boolean
  enableCaptcha?: boolean
  captchaSiteKey?: string
  captchaSecretKey?: string
  passwordMinLength?: number
  requirePasswordComplexity?: boolean
}

export interface SEOSettings {
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  googleAnalyticsId?: string
  facebookPixelId?: string
  googleTagManagerId?: string
  enableSitemap?: boolean
  enableRobotsTxt?: boolean
  canonicalUrl?: string
}

export interface SocialMediaSettings {
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  whatsappNumber?: string
}

export interface SettingsData {
  company?: { [key: string]: Setting }
  payment?: { [key: string]: Setting }
  notification?: { [key: string]: Setting }
  inventory?: { [key: string]: Setting }
  delivery?: { [key: string]: Setting }
  seo?: { [key: string]: Setting }
  security?: { [key: string]: Setting }
  email?: { [key: string]: Setting }
  social?: { [key: string]: Setting }
}

export interface SettingsResponse {
  success: boolean
  data: any
  message?: string
}

class SettingsApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async getSettings() {
    const response = await axios.get(`/api/settings`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async getPublicSettings() {
    const response = await axios.get(`/api/settings/public`)
    return response.data
  }

  async updateCompanySettings(settings: CompanySettings) {
    const response = await axios.post(`/api/settings/company`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async exportSettings() {
    const response = await axios.get(`/api/settings/export`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async importSettings(settings: any) {
    const response = await axios.post(`/api/settings/import`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async resetToDefaults() {
    const response = await axios.post(`/api/settings/reset`, {}, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateSettings(settings: any) {
    const response = await axios.put(`/api/settings`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async getDeliverySettings() {
    const response = await axios.get(`/api/settings/delivery`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateDeliverySettings(settings: any) {
    const response = await axios.put(`/api/settings/delivery`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async getPaymentSettings() {
    const response = await axios.get(`/api/settings/payment`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updatePaymentSettings(settings: any) {
    const response = await axios.put(`/api/settings/payment`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateInventorySettings(settings: InventorySettings) {
    const response = await axios.put(`/api/settings/inventory`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateNotificationSettings(settings: NotificationSettings) {
    const response = await axios.post(`/api/settings/notification`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateSecuritySettings(settings: SecuritySettings) {
    const response = await axios.put(`/api/settings/security`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateSEOSettings(settings: SEOSettings) {
    const response = await axios.put(`/api/settings/seo`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateSocialMediaSettings(settings: SocialMediaSettings) {
    const response = await axios.put(`/api/settings/social`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }


}

const settingsApi = new SettingsApiClient(API_BASE_URL)
export { settingsApi }
export default settingsApi