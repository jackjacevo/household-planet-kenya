import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, ValidateNested, IsArray, IsEmail, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  FILE = 'file',
  EMAIL = 'email',
  URL = 'url',
  COLOR = 'color',
}

export class UpdateSettingDto {
  @IsString()
  category: string;

  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsEnum(SettingType)
  @IsOptional()
  type?: SettingType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSettingDto)
  settings: UpdateSettingDto[];
}

// Company Settings
export class CompanySettingsDto {
  @IsString()
  @IsOptional()
  siteName?: string;

  @IsString()
  @IsOptional()
  siteDescription?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  favicon?: string;

  @IsString()
  @IsOptional()
  businessHours?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  language?: string;
}

// Payment Settings
export class PaymentSettingsDto {
  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsNumber()
  @IsOptional()
  shippingFee?: number;

  @IsNumber()
  @IsOptional()
  freeShippingThreshold?: number;

  @IsString()
  @IsOptional()
  mpesaShortcode?: string;

  @IsString()
  @IsOptional()
  mpesaPasskey?: string;

  @IsString()
  @IsOptional()
  mpesaConsumerKey?: string;

  @IsString()
  @IsOptional()
  mpesaConsumerSecret?: string;

  @IsString()
  @IsOptional()
  mpesaPaybill?: string;

  @IsString()
  @IsOptional()
  mpesaAccount?: string;

  @IsBoolean()
  @IsOptional()
  enableCashPayments?: boolean;

  @IsBoolean()
  @IsOptional()
  enableBankTransfer?: boolean;

  @IsString()
  @IsOptional()
  bankAccountDetails?: string;

  @IsArray()
  @IsOptional()
  acceptedPaymentMethods?: string[];
}

// Notification Settings
export class NotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  whatsappNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  orderConfirmationEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  orderStatusUpdates?: boolean;

  @IsBoolean()
  @IsOptional()
  lowStockAlerts?: boolean;

  @IsBoolean()
  @IsOptional()
  newCustomerNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  dailySalesReport?: boolean;

  @IsString()
  @IsOptional()
  notificationEmail?: string;

  @IsString()
  @IsOptional()
  whatsappApiKey?: string;

  @IsString()
  @IsOptional()
  smsApiKey?: string;
}

// Inventory Settings
export class InventorySettingsDto {
  @IsNumber()
  @IsOptional()
  lowStockThreshold?: number;

  @IsBoolean()
  @IsOptional()
  trackStock?: boolean;

  @IsBoolean()
  @IsOptional()
  autoApproveReviews?: boolean;

  @IsBoolean()
  @IsOptional()
  allowBackorders?: boolean;

  @IsBoolean()
  @IsOptional()
  showOutOfStock?: boolean;

  @IsNumber()
  @IsOptional()
  maxOrderQuantity?: number;

  @IsBoolean()
  @IsOptional()
  requireStockConfirmation?: boolean;
}

// SEO Settings
export class SEOSettingsDto {
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @IsString()
  @IsOptional()
  googleAnalyticsId?: string;

  @IsString()
  @IsOptional()
  facebookPixelId?: string;

  @IsString()
  @IsOptional()
  googleTagManagerId?: string;

  @IsBoolean()
  @IsOptional()
  enableSitemap?: boolean;

  @IsBoolean()
  @IsOptional()
  enableRobotsTxt?: boolean;

  @IsString()
  @IsOptional()
  canonicalUrl?: string;
}

// Security Settings
export class SecuritySettingsDto {
  @IsNumber()
  @IsOptional()
  sessionTimeout?: number;

  @IsNumber()
  @IsOptional()
  maxLoginAttempts?: number;

  @IsNumber()
  @IsOptional()
  lockoutDuration?: number;

  @IsBoolean()
  @IsOptional()
  requireTwoFactor?: boolean;

  @IsBoolean()
  @IsOptional()
  enableCaptcha?: boolean;

  @IsString()
  @IsOptional()
  captchaSiteKey?: string;

  @IsString()
  @IsOptional()
  captchaSecretKey?: string;

  @IsNumber()
  @IsOptional()
  passwordMinLength?: number;

  @IsBoolean()
  @IsOptional()
  requirePasswordComplexity?: boolean;
}

// Email Settings
export class EmailSettingsDto {
  @IsString()
  @IsOptional()
  smtpHost?: string;

  @IsNumber()
  @IsOptional()
  smtpPort?: number;

  @IsString()
  @IsOptional()
  smtpUsername?: string;

  @IsString()
  @IsOptional()
  smtpPassword?: string;

  @IsBoolean()
  @IsOptional()
  smtpSecure?: boolean;

  @IsString()
  @IsOptional()
  fromEmail?: string;

  @IsString()
  @IsOptional()
  fromName?: string;

  @IsString()
  @IsOptional()
  replyToEmail?: string;
}

// Social Media Settings
export class SocialMediaSettingsDto {
  @IsUrl()
  @IsOptional()
  facebookUrl?: string;

  @IsUrl()
  @IsOptional()
  twitterUrl?: string;

  @IsUrl()
  @IsOptional()
  instagramUrl?: string;

  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @IsUrl()
  @IsOptional()
  youtubeUrl?: string;

  @IsUrl()
  @IsOptional()
  tiktokUrl?: string;

  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @IsString()
  @IsOptional()
  mpesaPaybill?: string;

  @IsString()
  @IsOptional()
  mpesaAccount?: string;
}

// Delivery Settings
export class DeliverySettingsDto {
  @IsArray()
  @IsOptional()
  deliveryLocations?: string[];

  @IsString()
  @IsOptional()
  defaultDeliveryTime?: string;

  @IsNumber()
  @IsOptional()
  maxDeliveryDistance?: number;

  @IsBoolean()
  @IsOptional()
  enableScheduledDelivery?: boolean;

  @IsArray()
  @IsOptional()
  deliveryTimeSlots?: string[];

  @IsNumber()
  @IsOptional()
  expressDeliveryFee?: number;

  @IsBoolean()
  @IsOptional()
  enableTrackingUpdates?: boolean;
}