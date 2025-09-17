import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface Setting {
  id: number;
  category: string;
  key: string;
  value: any;
  type: string;
  description?: string;
  isPublic: boolean;
  updatedAt: string;
}

export interface SettingsResponse {
  [category: string]: {
    [key: string]: Setting;
  };
}

export interface UpdateSettingRequest {
  category: string;
  key: string;
  value: string;
  type?: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateSettingsRequest {
  settings: UpdateSettingRequest[];
}

export interface CompanySettings {
  siteName?: string;
  siteDescription?: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  logo?: string;
  favicon?: string;
  businessHours?: string;
  timezone?: string;
  currency?: string;
  language?: string;
}

export interface PaymentSettings {
  taxRate?: number;
  shippingFee?: number;
  freeShippingThreshold?: number;
  mpesaShortcode?: string;
  mpesaPasskey?: string;
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaPaybill?: string;
  mpesaAccount?: string;
  enableCashPayments?: boolean;
  enableBankTransfer?: boolean;
  bankAccountDetails?: string;
  acceptedPaymentMethods?: string[];
}

export interface NotificationSettings {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  whatsappNotifications?: boolean;
  orderConfirmationEmail?: boolean;
  orderStatusUpdates?: boolean;
  lowStockAlerts?: boolean;
  newCustomerNotifications?: boolean;
  dailySalesReport?: boolean;
  notificationEmail?: string;
  whatsappApiKey?: string;
  smsApiKey?: string;
}

export interface InventorySettings {
  lowStockThreshold?: number;
  trackStock?: boolean;
  autoApproveReviews?: boolean;
  allowBackorders?: boolean;
  showOutOfStock?: boolean;
  maxOrderQuantity?: number;
  requireStockConfirmation?: boolean;
}

export interface SEOSettings {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  googleTagManagerId?: string;
  enableSitemap?: boolean;
  enableRobotsTxt?: boolean;
  canonicalUrl?: string;
}

export interface SecuritySettings {
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  lockoutDuration?: number;
  requireTwoFactor?: boolean;
  enableCaptcha?: boolean;
  captchaSiteKey?: string;
  captchaSecretKey?: string;
  passwordMinLength?: number;
  requirePasswordComplexity?: boolean;
}

export interface EmailSettings {
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  fromEmail?: string;
  fromName?: string;
  replyToEmail?: string;
}

export interface SocialMediaSettings {
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  whatsappNumber?: string;
}

export interface DeliverySettings {
  deliveryLocations?: string[];
  defaultDeliveryTime?: string;
  maxDeliveryDistance?: number;
  enableScheduledDelivery?: boolean;
  deliveryTimeSlots?: string[];
  expressDeliveryFee?: number;
  enableTrackingUpdates?: boolean;
}

export const settingsApi = {
  // Get all settings or by category
  getSettings: async (category?: string): Promise<SettingsResponse> => {
    try {
      const params = category ? { category } : {};
      console.log('Fetching settings with params:', params);
      const response = await api.get('/api/admin/settings', { params });
      console.log('Settings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Settings API error:', error);
      // Return empty object if API fails
      return {};
    }
  },

  // Get public settings (no auth required)
  getPublicSettings: async (): Promise<SettingsResponse> => {
    const response = await api.get('/api/admin/settings/public');
    return response.data;
  },

  // Get specific setting
  getSetting: async (category: string, key: string): Promise<Setting> => {
    const response = await api.get(`/api/admin/settings/${category}/${key}`);
    return response.data;
  },

  // Update multiple settings
  updateSettings: async (data: UpdateSettingsRequest) => {
    const response = await api.put('/api/admin/settings', data);
    return response.data;
  },

  // Update single setting
  updateSetting: async (data: UpdateSettingRequest) => {
    const response = await api.put('/api/admin/settings/single', data);
    return response.data;
  },

  // Category-specific updates
  updateCompanySettings: async (data: CompanySettings) => {
    const response = await api.put('/api/admin/settings/company', data);
    return response.data;
  },

  updatePaymentSettings: async (data: PaymentSettings) => {
    const response = await api.put('/api/admin/settings/payment', data);
    return response.data;
  },

  updateNotificationSettings: async (data: NotificationSettings) => {
    const response = await api.put('/api/admin/settings/notification', data);
    return response.data;
  },

  updateInventorySettings: async (data: InventorySettings) => {
    const response = await api.put('/api/admin/settings/inventory', data);
    return response.data;
  },

  updateSEOSettings: async (data: SEOSettings) => {
    const response = await api.put('/api/admin/settings/seo', data);
    return response.data;
  },

  updateSecuritySettings: async (data: SecuritySettings) => {
    const response = await api.put('/api/admin/settings/security', data);
    return response.data;
  },

  updateEmailSettings: async (data: EmailSettings) => {
    const response = await api.put('/api/admin/settings/email', data);
    return response.data;
  },

  updateSocialMediaSettings: async (data: SocialMediaSettings) => {
    const response = await api.put('/api/admin/settings/social', data);
    return response.data;
  },

  updateDeliverySettings: async (data: DeliverySettings) => {
    const response = await api.put('/api/admin/settings/delivery', data);
    return response.data;
  },

  // Reset settings to defaults
  resetToDefaults: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await api.post('/api/admin/settings/reset', {}, { params });
    return response.data;
  },

  // Export settings
  exportSettings: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await api.get('/api/admin/settings/export', { params });
    return response.data;
  },

  // Import settings
  importSettings: async (settingsData: any) => {
    const response = await api.post('/api/admin/settings/import', settingsData);
    return response.data;
  },
};
