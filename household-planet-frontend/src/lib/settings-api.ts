import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://householdplanetkenya.co.ke/api'

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

export interface SettingsData {
  company?: any
  payment?: any
  notification?: any
  inventory?: any
  delivery?: any
  seo?: any
  security?: any
  email?: any
  social?: any
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
    const response = await axios.get(`${this.baseURL}/api/settings`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async getPublicSettings() {
    const response = await axios.get(`${this.baseURL}/api/settings/public`)
    return response.data
  }

  async updateCompanySettings(settings: CompanySettings) {
    const response = await axios.put(`${this.baseURL}/api/settings/company`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async exportSettings() {
    const response = await axios.get(`${this.baseURL}/api/settings/export`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async importSettings(settings: any) {
    const response = await axios.post(`${this.baseURL}/api/settings/import`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async resetToDefaults() {
    const response = await axios.post(`${this.baseURL}/api/settings/reset`, {}, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateSettings(settings: any) {
    const response = await axios.put(`${this.baseURL}/api/settings`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async getDeliverySettings() {
    const response = await axios.get(`${this.baseURL}/api/settings/delivery`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updateDeliverySettings(settings: any) {
    const response = await axios.put(`${this.baseURL}/api/settings/delivery`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async getPaymentSettings() {
    const response = await axios.get(`${this.baseURL}/api/settings/payment`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async updatePaymentSettings(settings: any) {
    const response = await axios.put(`${this.baseURL}/api/settings/payment`, settings, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async getPublicSettings() {
    const response = await axios.get(`${this.baseURL}/api/settings/public`)
    return response.data
  }

  async exportSettings() {
    const response = await axios.get(`${this.baseURL}/api/settings/export`, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async importSettings(data: any) {
    const response = await axios.post(`${this.baseURL}/api/settings/import`, data, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }

  async resetToDefaults() {
    const response = await axios.post(`${this.baseURL}/api/settings/reset`, {}, {
      headers: this.getAuthHeaders(),
    })
    return response.data
  }
}

const settingsApi = new SettingsApiClient(API_BASE_URL)
export { settingsApi }
export default settingsApi