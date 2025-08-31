const axios = require('axios');

async function testWhatsAppOrderActivityLogging() {
  try {
    console.log('Testing WhatsApp order activity logging...');
    
    // First, login as admin to get token
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2024!'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');
    
    // Create a WhatsApp order
    const whatsappOrderData = {
      customerName: 'Test Customer Activity',
      customerPhone: '+254712345678',
      customerEmail: 'test.activity@example.com',
      orderDetails: 'Test order for activity logging verification',
      paymentMode: 'Cash on Delivery',
      deliveryType: 'Standard',
      deliveryCost: 200,
      estimatedTotal: 1500,
      deliveryLocation: 'Nairobi CBD',
      notes: 'Testing activity logging functionality'
    };
    
    const orderResponse = await axios.post(
      'http://localhost:3001/orders/whatsapp',
      whatsappOrderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ WhatsApp order created:', orderResponse.data.orderNumber);
    
    // Wait a moment for activity to be logged
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check admin activities to see if the WhatsApp order creation was logged
    const activitiesResponse = await axios.get(
      'http://localhost:3001/admin/activities?action=CREATE_WHATSAPP_ORDER&limit=10',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('📊 Recent activities:', activitiesResponse.data.data.length);
    
    // Look for the specific WhatsApp order creation activity
    const whatsappActivity = activitiesResponse.data.data.find(
      activity => activity.action === 'CREATE_WHATSAPP_ORDER' && 
      activity.details.orderNumber === orderResponse.data.orderNumber
    );
    
    if (whatsappActivity) {
      console.log('✅ SUCCESS: WhatsApp order creation activity found in Admin Activity Log!');
      console.log('Activity details:', {
        action: whatsappActivity.action,
        orderNumber: whatsappActivity.details.orderNumber,
        customerName: whatsappActivity.details.customerName,
        timestamp: whatsappActivity.createdAt,
        user: whatsappActivity.user.name
      });
    } else {
      console.log('❌ ISSUE: WhatsApp order creation activity NOT found in Admin Activity Log');
      console.log('Available activities:', activitiesResponse.data.data.map(a => ({
        action: a.action,
        details: a.details
      })));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWhatsAppOrderActivityLogging();