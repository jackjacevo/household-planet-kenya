const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSettings() {
  try {
    console.log('🌱 Seeding comprehensive settings data...');

    // Clear existing settings
    await prisma.setting.deleteMany({});

    // Company Settings
    const companySettings = [
      { category: 'company', key: 'site_name', value: 'Household Planet Kenya', type: 'string', description: 'Website name', isPublic: true },
      { category: 'company', key: 'site_description', value: 'Your one-stop shop for quality household items in Kenya', type: 'string', description: 'Website description', isPublic: true },
      { category: 'company', key: 'company_name', value: 'Household Planet Kenya Ltd', type: 'string', description: 'Legal company name', isPublic: true },
      { category: 'company', key: 'contact_email', value: 'info@householdplanet.co.ke', type: 'string', description: 'Main contact email', isPublic: true },
      { category: 'company', key: 'contact_phone', value: '+254700000000', type: 'string', description: 'Main contact phone', isPublic: true },
      { category: 'company', key: 'address', value: 'Nairobi, Kenya', type: 'string', description: 'Company address', isPublic: true },
      { category: 'company', key: 'currency', value: 'KSh', type: 'string', description: 'Default currency', isPublic: true },
      { category: 'company', key: 'timezone', value: 'Africa/Nairobi', type: 'string', description: 'Default timezone', isPublic: false },
      { category: 'company', key: 'logo_url', value: '/images/logo.png', type: 'string', description: 'Company logo URL', isPublic: true },
      { category: 'company', key: 'favicon_url', value: '/favicon.ico', type: 'string', description: 'Favicon URL', isPublic: true }
    ];

    // Payment Settings
    const paymentSettings = [
      { category: 'payment', key: 'tax_rate', value: '16', type: 'number', description: 'VAT tax rate percentage', isPublic: true },
      { category: 'payment', key: 'shipping_fee', value: '200', type: 'number', description: 'Default shipping fee', isPublic: true },
      { category: 'payment', key: 'free_shipping_threshold', value: '5000', type: 'number', description: 'Minimum order for free shipping', isPublic: true },
      { category: 'payment', key: 'mpesa_shortcode', value: '174379', type: 'string', description: 'M-Pesa business shortcode', isPublic: false },
      { category: 'payment', key: 'mpesa_passkey', value: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919', type: 'string', description: 'M-Pesa passkey', isPublic: false },
      { category: 'payment', key: 'enable_cash_payments', value: 'true', type: 'boolean', description: 'Enable cash on delivery', isPublic: true },
      { category: 'payment', key: 'enable_bank_transfer', value: 'true', type: 'boolean', description: 'Enable bank transfer payments', isPublic: true },
      { category: 'payment', key: 'enable_card_payments', value: 'true', type: 'boolean', description: 'Enable card payments', isPublic: true },
      { category: 'payment', key: 'payment_timeout', value: '300', type: 'number', description: 'Payment timeout in seconds', isPublic: false }
    ];

    // Notification Settings
    const notificationSettings = [
      { category: 'notification', key: 'email_notifications', value: 'true', type: 'boolean', description: 'Enable email notifications', isPublic: false },
      { category: 'notification', key: 'sms_notifications', value: 'true', type: 'boolean', description: 'Enable SMS notifications', isPublic: false },
      { category: 'notification', key: 'low_stock_alerts', value: 'true', type: 'boolean', description: 'Enable low stock alerts', isPublic: false },
      { category: 'notification', key: 'order_notifications', value: 'true', type: 'boolean', description: 'Enable order notifications', isPublic: false },
      { category: 'notification', key: 'admin_email', value: 'admin@householdplanet.co.ke', type: 'string', description: 'Admin notification email', isPublic: false },
      { category: 'notification', key: 'notification_frequency', value: 'immediate', type: 'string', description: 'Notification frequency', isPublic: false }
    ];

    // Inventory Settings
    const inventorySettings = [
      { category: 'inventory', key: 'low_stock_threshold', value: '10', type: 'number', description: 'Default low stock threshold', isPublic: false },
      { category: 'inventory', key: 'track_stock', value: 'true', type: 'boolean', description: 'Enable stock tracking', isPublic: false },
      { category: 'inventory', key: 'auto_approve_reviews', value: 'false', type: 'boolean', description: 'Auto approve product reviews', isPublic: false },
      { category: 'inventory', key: 'allow_backorders', value: 'false', type: 'boolean', description: 'Allow backorders when out of stock', isPublic: true },
      { category: 'inventory', key: 'stock_reservation_time', value: '15', type: 'number', description: 'Stock reservation time in minutes', isPublic: false }
    ];

    // SEO Settings
    const seoSettings = [
      { category: 'seo', key: 'meta_title', value: 'Household Planet Kenya - Quality Home Products', type: 'string', description: 'Default meta title', isPublic: true },
      { category: 'seo', key: 'meta_description', value: 'Shop quality household items, kitchen appliances, home decor and more. Fast delivery across Kenya. Best prices guaranteed.', type: 'string', description: 'Default meta description', isPublic: true },
      { category: 'seo', key: 'meta_keywords', value: 'household items Kenya, kitchen appliances, home decor, online shopping Kenya', type: 'string', description: 'Default meta keywords', isPublic: true },
      { category: 'seo', key: 'google_analytics_id', value: 'GA-XXXXXXXXX', type: 'string', description: 'Google Analytics tracking ID', isPublic: true },
      { category: 'seo', key: 'google_tag_manager_id', value: 'GTM-XXXXXXX', type: 'string', description: 'Google Tag Manager ID', isPublic: true },
      { category: 'seo', key: 'facebook_pixel_id', value: '', type: 'string', description: 'Facebook Pixel ID', isPublic: true }
    ];

    // Security Settings
    const securitySettings = [
      { category: 'security', key: 'enable_2fa', value: 'true', type: 'boolean', description: 'Enable two-factor authentication', isPublic: false },
      { category: 'security', key: 'session_timeout', value: '3600', type: 'number', description: 'Session timeout in seconds', isPublic: false },
      { category: 'security', key: 'max_login_attempts', value: '5', type: 'number', description: 'Maximum login attempts before lockout', isPublic: false },
      { category: 'security', key: 'lockout_duration', value: '900', type: 'number', description: 'Account lockout duration in seconds', isPublic: false },
      { category: 'security', key: 'password_min_length', value: '8', type: 'number', description: 'Minimum password length', isPublic: true },
      { category: 'security', key: 'require_password_complexity', value: 'true', type: 'boolean', description: 'Require complex passwords', isPublic: true }
    ];

    // Email Settings
    const emailSettings = [
      { category: 'email', key: 'smtp_host', value: 'smtp.gmail.com', type: 'string', description: 'SMTP server host', isPublic: false },
      { category: 'email', key: 'smtp_port', value: '587', type: 'number', description: 'SMTP server port', isPublic: false },
      { category: 'email', key: 'smtp_username', value: 'noreply@householdplanet.co.ke', type: 'string', description: 'SMTP username', isPublic: false },
      { category: 'email', key: 'smtp_password', value: 'your-app-password', type: 'string', description: 'SMTP password', isPublic: false },
      { category: 'email', key: 'from_email', value: 'noreply@householdplanet.co.ke', type: 'string', description: 'Default from email', isPublic: false },
      { category: 'email', key: 'from_name', value: 'Household Planet Kenya', type: 'string', description: 'Default from name', isPublic: false }
    ];

    // Social Media Settings
    const socialSettings = [
      { category: 'social', key: 'facebook_url', value: 'https://facebook.com/householdplanetkenya', type: 'string', description: 'Facebook page URL', isPublic: true },
      { category: 'social', key: 'twitter_url', value: 'https://twitter.com/householdplanet', type: 'string', description: 'Twitter profile URL', isPublic: true },
      { category: 'social', key: 'instagram_url', value: 'https://instagram.com/householdplanetkenya', type: 'string', description: 'Instagram profile URL', isPublic: true },
      { category: 'social', key: 'whatsapp_number', value: '+254700000000', type: 'string', description: 'WhatsApp business number', isPublic: true },
      { category: 'social', key: 'youtube_url', value: '', type: 'string', description: 'YouTube channel URL', isPublic: true },
      { category: 'social', key: 'linkedin_url', value: '', type: 'string', description: 'LinkedIn company URL', isPublic: true }
    ];

    // Delivery Settings
    const deliverySettings = [
      { category: 'delivery', key: 'default_delivery_time', value: '2-3', type: 'string', description: 'Default delivery time in days', isPublic: true },
      { category: 'delivery', key: 'express_delivery_available', value: 'true', type: 'boolean', description: 'Enable express delivery', isPublic: true },
      { category: 'delivery', key: 'express_delivery_fee', value: '500', type: 'number', description: 'Express delivery fee', isPublic: true },
      { category: 'delivery', key: 'delivery_cutoff_time', value: '15:00', type: 'string', description: 'Daily cutoff time for same-day processing', isPublic: true },
      { category: 'delivery', key: 'weekend_delivery', value: 'false', type: 'boolean', description: 'Enable weekend delivery', isPublic: true }
    ];

    // Combine all settings
    const allSettings = [
      ...companySettings,
      ...paymentSettings,
      ...notificationSettings,
      ...inventorySettings,
      ...seoSettings,
      ...securitySettings,
      ...emailSettings,
      ...socialSettings,
      ...deliverySettings
    ];

    // Create all settings
    for (const setting of allSettings) {
      await prisma.setting.create({ data: setting });
    }

    console.log('✅ Settings seeding completed successfully:');
    console.log(`- ${companySettings.length} company settings`);
    console.log(`- ${paymentSettings.length} payment settings`);
    console.log(`- ${notificationSettings.length} notification settings`);
    console.log(`- ${inventorySettings.length} inventory settings`);
    console.log(`- ${seoSettings.length} SEO settings`);
    console.log(`- ${securitySettings.length} security settings`);
    console.log(`- ${emailSettings.length} email settings`);
    console.log(`- ${socialSettings.length} social media settings`);
    console.log(`- ${deliverySettings.length} delivery settings`);
    console.log(`- Total: ${allSettings.length} settings`);

  } catch (error) {
    console.error('❌ Settings seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { seedSettings };

if (require.main === module) {
  seedSettings();
}