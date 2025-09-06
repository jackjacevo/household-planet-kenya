import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { UpdateSettingDto, UpdateSettingsDto, SettingType } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  private settingsCache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {
    this.initializeDefaultSettings();
  }

  async getAllSettings(category?: string) {
    const cacheKey = category || 'all';
    
    if (this.isCacheValid(cacheKey)) {
      return this.settingsCache.get(cacheKey);
    }

    const where = category ? { category } : {};
    const settings = await this.prisma.setting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    const result = this.transformSettings(settings);
    this.updateCache(cacheKey, result);
    
    return result;
  }

  async getPublicSettings() {
    const cacheKey = 'public';
    
    if (this.isCacheValid(cacheKey)) {
      return this.settingsCache.get(cacheKey);
    }

    const settings = await this.prisma.setting.findMany({
      where: { isPublic: true },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    const result = this.transformSettings(settings);
    this.updateCache(cacheKey, result);
    
    return result;
  }

  async getSetting(category: string, key: string) {
    const cacheKey = `${category}.${key}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.settingsCache.get(cacheKey);
    }

    const setting = await this.prisma.setting.findUnique({
      where: { category_key: { category, key } },
    });

    if (!setting) {
      throw new NotFoundException(`Setting ${category}.${key} not found`);
    }

    const result = this.parseSettingValue(setting);
    this.updateCache(cacheKey, result);
    
    return result;
  }

  async updateSettings(updateDto: UpdateSettingsDto, userId?: number, ipAddress?: string, userAgent?: string) {
    const results = [];
    const errors = [];

    for (const settingDto of updateDto.settings) {
      try {
        const result = await this.updateSetting(settingDto, userId, ipAddress, userAgent);
        results.push(result);
      } catch (error) {
        errors.push({
          setting: `${settingDto.category}.${settingDto.key}`,
          error: error.message,
        });
      }
    }

    // Clear cache after updates
    this.clearCache();

    return {
      updated: results.length,
      errors: errors.length > 0 ? errors : undefined,
      settings: results,
    };
  }

  async updateSetting(updateDto: UpdateSettingDto, userId?: number, ipAddress?: string, userAgent?: string) {
    const { category, key, value, type, description, isPublic } = updateDto;

    // Validate setting value based on type
    this.validateSettingValue(value, type || SettingType.STRING);

    const existingSetting = await this.prisma.setting.findUnique({
      where: { category_key: { category, key } },
    });

    let setting;
    if (existingSetting) {
      setting = await this.prisma.setting.update({
        where: { category_key: { category, key } },
        data: {
          value,
          type: type || existingSetting.type,
          description: description || existingSetting.description,
          isPublic: isPublic !== undefined ? isPublic : existingSetting.isPublic,
        },
      });
    } else {
      setting = await this.prisma.setting.create({
        data: {
          category,
          key,
          value,
          type: type || SettingType.STRING,
          description,
          isPublic: isPublic || false,
        },
      });
    }

    // Log activity
    if (userId) {
      await this.activityService.logActivity(
        userId,
        existingSetting ? 'UPDATE_SETTING' : 'CREATE_SETTING',
        {
          category,
          key,
          oldValue: existingSetting?.value,
          newValue: value,
        },
        'Setting',
        setting.id,
        ipAddress,
        userAgent,
      ).catch(console.error);
    }

    // Clear cache for this setting
    this.clearCacheForSetting(category, key);

    return this.parseSettingValue(setting);
  }

  async resetToDefaults(category?: string, userId?: number, ipAddress?: string, userAgent?: string) {
    const defaults = this.getDefaultSettings();
    const settingsToReset = category 
      ? defaults.filter(s => s.category === category)
      : defaults;

    const results = [];
    for (const defaultSetting of settingsToReset) {
      try {
        const result = await this.updateSetting(defaultSetting, userId, ipAddress, userAgent);
        results.push(result);
      } catch (error) {
        console.error(`Failed to reset setting ${defaultSetting.category}.${defaultSetting.key}:`, error);
      }
    }

    this.clearCache();

    if (userId) {
      await this.activityService.logActivity(
        userId,
        'RESET_SETTINGS',
        { category: category || 'all', count: results.length },
        'Setting',
        null,
        ipAddress,
        userAgent,
      ).catch(console.error);
    }

    return { reset: results.length, settings: results };
  }

  async exportSettings(category?: string) {
    const settings = await this.getAllSettings(category);
    return {
      exportedAt: new Date().toISOString(),
      category: category || 'all',
      settings,
    };
  }

  async importSettings(settingsData: any, userId?: number, ipAddress?: string, userAgent?: string) {
    if (!settingsData.settings || !Array.isArray(settingsData.settings)) {
      throw new BadRequestException('Invalid settings data format');
    }

    const updateDto: UpdateSettingsDto = {
      settings: settingsData.settings.map(setting => ({
        category: setting.category,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description,
        isPublic: setting.isPublic,
      })),
    };

    const result = await this.updateSettings(updateDto, userId, ipAddress, userAgent);

    if (userId) {
      await this.activityService.logActivity(
        userId,
        'IMPORT_SETTINGS',
        { count: updateDto.settings.length, source: settingsData.category || 'unknown' },
        'Setting',
        null,
        ipAddress,
        userAgent,
      ).catch(console.error);
    }

    return result;
  }

  private transformSettings(settings: any[]) {
    const grouped = {};
    
    for (const setting of settings) {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {};
      }
      grouped[setting.category][setting.key] = this.parseSettingValue(setting);
    }

    return grouped;
  }

  private parseSettingValue(setting: any) {
    let parsedValue;
    
    try {
      switch (setting.type) {
        case SettingType.NUMBER:
          parsedValue = parseFloat(setting.value);
          break;
        case SettingType.BOOLEAN:
          parsedValue = setting.value === 'true';
          break;
        case SettingType.JSON:
          parsedValue = JSON.parse(setting.value);
          break;
        default:
          parsedValue = setting.value;
      }
    } catch (error) {
      parsedValue = setting.value;
    }

    return {
      id: setting.id,
      category: setting.category,
      key: setting.key,
      value: parsedValue,
      type: setting.type,
      description: setting.description,
      isPublic: setting.isPublic,
      updatedAt: setting.updatedAt,
    };
  }

  private validateSettingValue(value: string, type: SettingType) {
    switch (type) {
      case SettingType.NUMBER:
        if (isNaN(parseFloat(value))) {
          throw new BadRequestException(`Invalid number value: ${value}`);
        }
        break;
      case SettingType.BOOLEAN:
        if (!['true', 'false'].includes(value.toLowerCase())) {
          throw new BadRequestException(`Invalid boolean value: ${value}`);
        }
        break;
      case SettingType.JSON:
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException(`Invalid JSON value: ${value}`);
        }
        break;
      case SettingType.EMAIL:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new BadRequestException(`Invalid email value: ${value}`);
        }
        break;
      case SettingType.URL:
        try {
          new URL(value);
        } catch {
          throw new BadRequestException(`Invalid URL value: ${value}`);
        }
        break;
    }
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private updateCache(key: string, value: any) {
    this.settingsCache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  private clearCache() {
    this.settingsCache.clear();
    this.cacheExpiry.clear();
  }

  private clearCacheForSetting(category: string, key: string) {
    const keysToDelete = [];
    for (const cacheKey of this.settingsCache.keys()) {
      if (cacheKey === 'all' || cacheKey === category || cacheKey === `${category}.${key}`) {
        keysToDelete.push(cacheKey);
      }
    }
    keysToDelete.forEach(k => {
      this.settingsCache.delete(k);
      this.cacheExpiry.delete(k);
    });
  }

  private async initializeDefaultSettings() {
    try {
      const existingSettings = await this.prisma.setting.count();
      if (existingSettings === 0) {
        const defaults = this.getDefaultSettings();
        for (const setting of defaults) {
          await this.prisma.setting.create({ data: setting }).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Failed to initialize default settings:', error);
    }
  }

  private getDefaultSettings() {
    return [
      // Company Settings
      { category: 'company', key: 'site_name', value: 'Household Planet Kenya', type: SettingType.STRING, description: 'Website name', isPublic: true },
      { category: 'company', key: 'site_description', value: 'Your one-stop shop for household items in Kenya', type: SettingType.STRING, description: 'Website description', isPublic: true },
      { category: 'company', key: 'company_name', value: 'Household Planet Kenya Ltd', type: SettingType.STRING, description: 'Legal company name', isPublic: true },
      { category: 'company', key: 'contact_email', value: 'info@householdplanet.co.ke', type: SettingType.EMAIL, description: 'Main contact email', isPublic: true },
      { category: 'company', key: 'contact_phone', value: '+254700000000', type: SettingType.STRING, description: 'Main contact phone', isPublic: true },
      { category: 'company', key: 'city', value: 'Nairobi', type: SettingType.STRING, description: 'Company city', isPublic: true },
      { category: 'company', key: 'country', value: 'Kenya', type: SettingType.STRING, description: 'Company country', isPublic: true },
      { category: 'company', key: 'postal_code', value: '00100', type: SettingType.STRING, description: 'Postal code', isPublic: true },
      { category: 'company', key: 'business_hours', value: 'Mon-Fri 9AM-6PM', type: SettingType.STRING, description: 'Business hours', isPublic: true },
      { category: 'company', key: 'address', value: 'Nairobi, Kenya', type: SettingType.STRING, description: 'Company address', isPublic: true },
      { category: 'company', key: 'currency', value: 'KSh', type: SettingType.STRING, description: 'Default currency', isPublic: true },
      { category: 'company', key: 'timezone', value: 'Africa/Nairobi', type: SettingType.STRING, description: 'Default timezone', isPublic: false },
      { category: 'company', key: 'language', value: 'en', type: SettingType.STRING, description: 'Default language', isPublic: true },

      // Payment Settings
      { category: 'payment', key: 'tax_rate', value: '16', type: SettingType.NUMBER, description: 'VAT rate percentage', isPublic: true },
      { category: 'payment', key: 'shipping_fee', value: '200', type: SettingType.NUMBER, description: 'Default shipping fee', isPublic: true },
      { category: 'payment', key: 'free_shipping_threshold', value: '5000', type: SettingType.NUMBER, description: 'Free shipping minimum amount', isPublic: true },
      { category: 'payment', key: 'mpesa_shortcode', value: '174379', type: SettingType.STRING, description: 'M-Pesa API shortcode', isPublic: false },
      { category: 'payment', key: 'mpesa_paybill', value: '522522', type: SettingType.STRING, description: 'M-Pesa Paybill number', isPublic: true },
      { category: 'payment', key: 'mpesa_account', value: '', type: SettingType.STRING, description: 'M-Pesa account number', isPublic: true },
      { category: 'payment', key: 'enable_cash_payments', value: 'true', type: SettingType.BOOLEAN, description: 'Allow cash on delivery', isPublic: true },
      { category: 'payment', key: 'enable_bank_transfer', value: 'true', type: SettingType.BOOLEAN, description: 'Allow bank transfers', isPublic: true },

      // Notification Settings
      { category: 'notification', key: 'email_notifications', value: 'true', type: SettingType.BOOLEAN, description: 'Enable email notifications', isPublic: false },
      { category: 'notification', key: 'sms_notifications', value: 'true', type: SettingType.BOOLEAN, description: 'Enable SMS notifications', isPublic: false },
      { category: 'notification', key: 'whatsapp_notifications', value: 'true', type: SettingType.BOOLEAN, description: 'Enable WhatsApp notifications', isPublic: false },
      { category: 'notification', key: 'order_confirmation_email', value: 'true', type: SettingType.BOOLEAN, description: 'Send order confirmation emails', isPublic: false },
      { category: 'notification', key: 'low_stock_alerts', value: 'true', type: SettingType.BOOLEAN, description: 'Send low stock alerts', isPublic: false },
      { category: 'notification', key: 'notification_email', value: 'info@householdplanet.co.ke', type: SettingType.EMAIL, description: 'Notification email address', isPublic: false },

      // Inventory Settings
      { category: 'inventory', key: 'low_stock_threshold', value: '10', type: SettingType.NUMBER, description: 'Low stock alert threshold', isPublic: false },
      { category: 'inventory', key: 'track_stock', value: 'true', type: SettingType.BOOLEAN, description: 'Enable stock tracking', isPublic: false },
      { category: 'inventory', key: 'auto_approve_reviews', value: 'false', type: SettingType.BOOLEAN, description: 'Auto-approve customer reviews', isPublic: false },
      { category: 'inventory', key: 'allow_backorders', value: 'false', type: SettingType.BOOLEAN, description: 'Allow backorders', isPublic: true },
      { category: 'inventory', key: 'show_out_of_stock', value: 'true', type: SettingType.BOOLEAN, description: 'Show out of stock products', isPublic: true },

      // SEO Settings
      { category: 'seo', key: 'meta_title', value: 'Household Planet Kenya - Quality Household Items', type: SettingType.STRING, description: 'Default meta title', isPublic: true },
      { category: 'seo', key: 'meta_description', value: 'Shop quality household items in Kenya. Fast delivery, great prices, excellent customer service.', type: SettingType.STRING, description: 'Default meta description', isPublic: true },
      { category: 'seo', key: 'enable_sitemap', value: 'true', type: SettingType.BOOLEAN, description: 'Generate XML sitemap', isPublic: false },
      { category: 'seo', key: 'enable_robots_txt', value: 'true', type: SettingType.BOOLEAN, description: 'Generate robots.txt', isPublic: false },

      // Security Settings
      { category: 'security', key: 'session_timeout', value: '3600', type: SettingType.NUMBER, description: 'Session timeout in seconds', isPublic: false },
      { category: 'security', key: 'max_login_attempts', value: '5', type: SettingType.NUMBER, description: 'Maximum login attempts', isPublic: false },
      { category: 'security', key: 'lockout_duration', value: '900', type: SettingType.NUMBER, description: 'Account lockout duration in seconds', isPublic: false },
      { category: 'security', key: 'password_min_length', value: '8', type: SettingType.NUMBER, description: 'Minimum password length', isPublic: false },

      // Delivery Settings
      { category: 'delivery', key: 'default_delivery_time', value: '1-3 business days', type: SettingType.STRING, description: 'Default delivery timeframe', isPublic: true },
      { category: 'delivery', key: 'enable_scheduled_delivery', value: 'true', type: SettingType.BOOLEAN, description: 'Allow scheduled deliveries', isPublic: true },
      { category: 'delivery', key: 'enable_tracking_updates', value: 'true', type: SettingType.BOOLEAN, description: 'Send tracking updates', isPublic: false },

      // Social Media Settings
      { category: 'social', key: 'facebook_url', value: '', type: SettingType.URL, description: 'Facebook page URL', isPublic: true },
      { category: 'social', key: 'twitter_url', value: '', type: SettingType.URL, description: 'Twitter profile URL', isPublic: true },
      { category: 'social', key: 'instagram_url', value: '', type: SettingType.URL, description: 'Instagram profile URL', isPublic: true },
      { category: 'social', key: 'linkedin_url', value: '', type: SettingType.URL, description: 'LinkedIn profile URL', isPublic: true },
      { category: 'social', key: 'youtube_url', value: '', type: SettingType.URL, description: 'YouTube channel URL', isPublic: true },
      { category: 'social', key: 'tiktok_url', value: '', type: SettingType.URL, description: 'TikTok profile URL', isPublic: true },
      { category: 'social', key: 'whatsapp_number', value: '', type: SettingType.STRING, description: 'WhatsApp business number', isPublic: true },
    ];
  }
}