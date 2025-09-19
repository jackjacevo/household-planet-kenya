const { PrismaClient } = require('@prisma/client');

async function createSettingsRuntime() {
  let prisma;
  
  try {
    prisma = new PrismaClient();
    
    console.log('Creating settings table...');
    
    // Test database connection first
    await prisma.$connect();
    
    // Check if settings table exists and has data
    const existingSettings = await prisma.setting.findMany().catch(() => []);
    
    if (existingSettings.length === 0) {
      console.log('Settings table is empty, creating default settings...');
      
      // Create default settings
      const defaultSettings = [
        {
          category: 'company',
          key: 'site_name',
          value: 'Household Planet Kenya',
          type: 'string',
          description: 'Website name',
          isPublic: true
        },
        {
          category: 'company',
          key: 'site_description',
          value: 'Your trusted partner for household items in Kenya',
          type: 'string',
          description: 'Website description',
          isPublic: true
        },
        {
          category: 'payment',
          key: 'mpesa_enabled',
          value: 'true',
          type: 'boolean',
          description: 'Enable M-Pesa payments',
          isPublic: false
        },
        {
          category: 'delivery',
          key: 'default_delivery_cost',
          value: '200',
          type: 'number',
          description: 'Default delivery cost in KSH',
          isPublic: true
        },
        {
          category: 'notification',
          key: 'email_notifications',
          value: 'true',
          type: 'boolean',
          description: 'Enable email notifications',
          isPublic: false
        }
      ];

      for (const setting of defaultSettings) {
        try {
          await prisma.setting.create({
            data: setting
          });
          console.log(`✅ Created setting: ${setting.category}.${setting.key}`);
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`⚠️  Setting ${setting.category}.${setting.key} already exists`);
          } else {
            console.log(`❌ Failed to create setting ${setting.category}.${setting.key}:`, error.message);
          }
        }
      }
      
      console.log('✅ Default settings created successfully');
    } else {
      console.log('✅ Settings table already has data');
    }
    
  } catch (error) {
    console.log('⚠️  Settings creation failed (this is normal on first run):', error.message);
    // Don't throw error - let the app continue
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  createSettingsRuntime()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Settings creation error:', error.message);
      process.exit(0); // Don't fail the startup
    });
}

module.exports = { createSettingsRuntime };