// Email and SMS Notification Testing Script
const axios = require('axios');

const API_BASE = process.env.API_URL || 'https://householdplanetkenya.co.ke';

async function testEmailNotifications() {
  console.log('🔄 Testing Email Notifications...');
  
  const emailTests = [
    {
      type: 'welcome',
      data: { email: 'test@example.com', name: 'Test User' }
    },
    {
      type: 'order-confirmation',
      data: { 
        email: 'test@example.com', 
        orderId: 'TEST123', 
        total: 2500,
        items: [{ name: 'Test Product', quantity: 1, price: 2500 }]
      }
    },
    {
      type: 'shipping-notification',
      data: { 
        email: 'test@example.com', 
        orderId: 'TEST123',
        trackingNumber: 'TRK123456'
      }
    },
    {
      type: 'delivery-confirmation',
      data: { 
        email: 'test@example.com', 
        orderId: 'TEST123'
      }
    }
  ];

  for (const test of emailTests) {
    try {
      const response = await axios.post(`${API_BASE}/api/notifications/email`, {
        type: test.type,
        ...test.data
      });
      console.log(`✅ Email ${test.type}: Sent successfully`);
    } catch (error) {
      console.log(`❌ Email ${test.type}: Failed`, error.message);
    }
  }
}

async function testSMSNotifications() {
  console.log('🔄 Testing SMS Notifications...');
  
  const smsTests = [
    {
      type: 'order-confirmation',
      phone: '+254700000000',
      message: 'Order TEST123 confirmed. Total: KES 2500. Expected delivery: 2 days.'
    },
    {
      type: 'payment-received',
      phone: '+254700000000',
      message: 'Payment received for order TEST123. Processing your order now.'
    },
    {
      type: 'shipped',
      phone: '+254700000000',
      message: 'Order TEST123 shipped. Track: TRK123456'
    },
    {
      type: 'delivered',
      phone: '+254700000000',
      message: 'Order TEST123 delivered successfully. Thank you for shopping with us!'
    }
  ];

  for (const test of smsTests) {
    try {
      const response = await axios.post(`${API_BASE}/api/notifications/sms`, {
        phone: test.phone,
        message: test.message,
        type: test.type
      });
      console.log(`✅ SMS ${test.type}: Sent successfully`);
    } catch (error) {
      console.log(`❌ SMS ${test.type}: Failed`, error.message);
    }
  }
}

async function testWhatsAppNotifications() {
  console.log('🔄 Testing WhatsApp Notifications...');
  
  try {
    const response = await axios.post(`${API_BASE}/api/notifications/whatsapp`, {
      phone: '+254700000000',
      template: 'order_confirmation',
      parameters: ['TEST123', '2500', '2 days']
    });
    console.log('✅ WhatsApp Notifications: Working');
  } catch (error) {
    console.log('❌ WhatsApp Notifications: Failed', error.message);
  }
}

testEmailNotifications();
testSMSNotifications();
testWhatsAppNotifications();