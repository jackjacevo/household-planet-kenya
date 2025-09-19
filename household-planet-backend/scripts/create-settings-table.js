const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSettingsTable() {
  try {
    console.log('Creating settings table...');
    
    // Check if settings table exists
    const settings = await prisma.setting.findMany().catch(() => null);
    
    if (settings === null) {
      console.log('Settings table does not exist, creating...');
      
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
        await prisma.setting.create({
          data: setting
        });
      }
      
      console.log('Settings table created with default values');
    } else {
      console.log('Settings table already exists');
    }
    
  } catch (error) {
    console.error('Error creating settings table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createSettingsTable()
    .then(() => {
      console.log('Settings table setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to setup settings table:', error);
      process.exit(1);
    });
}

module.exports = { createSettingsTable };