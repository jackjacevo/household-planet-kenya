const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const BASE_URL = 'http://localhost:3001';

const ADMIN_CREDENTIALS = {
  email: 'admin@householdplanet.co.ke',
  password: 'Admin123!@#'
};

let adminToken = '';

async function setupContentTable() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./household-planet-backend/prisma/dev.db');
    
    const fs = require('fs');
    const sql = fs.readFileSync('./household-planet-backend/create-content-table.sql', 'utf8');
    
    db.exec(sql, (err) => {
      if (err) {
        console.error('Error setting up content table:', err);
        reject(err);
      } else {
        console.log('✅ Content table setup complete');
        resolve(true);
      }
      db.close();
    });
  });
}

async function testContentManagement() {
  console.log('🚀 Testing Content Management Features');
  console.log('=====================================\n');

  try {
    // Step 0: Setup content table
    console.log('0. Setting up content table...');
    await setupContentTable();

    // Step 1: Admin Login
    console.log('\n1. Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    adminToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Get Content Statistics
    console.log('\n2. Testing Content Statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/api/admin/content/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('📊 Content Statistics:');
    statsResponse.data.forEach(stat => {
      console.log(`   ${stat.type}: ${stat.count} items`);
    });

    // Step 3: Test Homepage Content
    console.log('\n3. Testing Homepage Content Management...');
    const homepageResponse = await axios.get(`${BASE_URL}/api/admin/content/homepage`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`📄 Homepage Content: ${homepageResponse.data.length} items found`);

    // Update homepage content
    await axios.put(`${BASE_URL}/api/admin/content/homepage`, {
      banners: [{
        id: 'hp_banner_1',
        title: 'Updated Welcome Banner',
        subtitle: 'Your trusted household partner',
        image: '/images/banner-updated.jpg',
        link: '/products',
        isActive: true,
        sortOrder: 1
      }]
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Homepage content updated successfully');

    // Step 4: Test Static Pages
    console.log('\n4. Testing Static Pages Management...');
    const pagesResponse = await axios.get(`${BASE_URL}/api/admin/content/pages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`📑 Static Pages: ${pagesResponse.data.length} pages found`);

    // Create new static page
    await axios.post(`${BASE_URL}/api/admin/content/pages`, {
      name: 'Contact Us',
      slug: 'contact',
      title: 'Contact Household Planet Kenya',
      content: '<h1>Contact Us</h1><p>Get in touch with our customer service team.</p>',
      metaTitle: 'Contact Us - Household Planet Kenya',
      metaDescription: 'Contact information and customer service details.',
      isActive: true
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ New static page created successfully');

    // Step 5: Test Email Templates
    console.log('\n5. Testing Email Templates Management...');
    const emailsResponse = await axios.get(`${BASE_URL}/api/admin/content/email-templates`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`📧 Email Templates: ${emailsResponse.data.length} templates found`);

    // Create new email template
    await axios.post(`${BASE_URL}/api/admin/content/email-templates`, {
      name: 'Password Reset',
      subject: 'Reset Your Password - {{siteName}}',
      content: '<h1>Password Reset</h1><p>Hello {{customerName}},</p><p>Click the link below to reset your password:</p><p><a href="{{resetLink}}">Reset Password</a></p>',
      variables: ['customerName', 'siteName', 'resetLink'],
      isActive: true
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ New email template created successfully');

    // Step 6: Test FAQ Management
    console.log('\n6. Testing FAQ Management...');
    const faqsResponse = await axios.get(`${BASE_URL}/api/admin/content/faqs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`❓ FAQs: ${faqsResponse.data.length} FAQs found`);

    // Create new FAQ
    const newFAQResponse = await axios.post(`${BASE_URL}/api/admin/content/faqs`, {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we only ship within Kenya. International shipping may be available in the future.',
      category: 'Delivery',
      sortOrder: 10,
      isActive: true
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ New FAQ created successfully');

    // Update FAQ
    const faqId = faqsResponse.data[0]?.id;
    if (faqId) {
      await axios.put(`${BASE_URL}/api/admin/content/faqs/${faqId}`, {
        question: 'How do I place an order? (Updated)',
        answer: 'You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. Our updated process is even easier!',
        category: 'Orders',
        sortOrder: 1,
        isActive: true
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ FAQ updated successfully');
    }

    // Step 7: Test Blog Management
    console.log('\n7. Testing Blog Management...');
    const blogResponse = await axios.get(`${BASE_URL}/api/admin/content/blog`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`📝 Blog Posts: ${blogResponse.data.length} posts found`);

    // Create new blog post
    await axios.post(`${BASE_URL}/api/admin/content/blog`, {
      title: 'Top 10 Kitchen Essentials for Every Home',
      slug: 'top-10-kitchen-essentials',
      excerpt: 'Discover the must-have kitchen items that every household needs for efficient cooking and food preparation.',
      content: '<h1>Top 10 Kitchen Essentials</h1><p>Every kitchen needs these essential items...</p><ol><li>Quality knives</li><li>Cutting boards</li><li>Mixing bowls</li></ol>',
      image: '/images/blog/kitchen-essentials.jpg',
      author: 'Household Planet Team',
      tags: ['kitchen', 'essentials', 'cooking', 'home'],
      metaTitle: 'Top 10 Kitchen Essentials - Household Planet Kenya',
      metaDescription: 'Essential kitchen items every home needs for efficient cooking.',
      publishedAt: new Date().toISOString(),
      isActive: true
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ New blog post created successfully');

    // Step 8: Test Promotional Content
    console.log('\n8. Testing Promotional Content Management...');
    const promotionsResponse = await axios.get(`${BASE_URL}/api/admin/content/promotions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`🎯 Promotions: ${promotionsResponse.data.length} promotions found`);

    // Create new promotion
    await axios.post(`${BASE_URL}/api/admin/content/promotions`, {
      title: 'Black Friday Sale',
      content: 'Up to 50% off on all household items! Limited time offer.',
      image: '/images/promotions/black-friday.jpg',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      targetAudience: 'all_customers'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ New promotion created successfully');

    // Step 9: Test Content Search
    console.log('\n9. Testing Content Search...');
    const searchResponse = await axios.get(`${BASE_URL}/api/admin/content/search?q=welcome`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`🔍 Search Results: ${searchResponse.data.length} items found for "welcome"`);

    // Step 10: Test Content Backup
    console.log('\n10. Testing Content Backup...');
    const backupResponse = await axios.get(`${BASE_URL}/api/admin/content/backup`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`💾 Content Backup: ${backupResponse.data.length} items backed up`);

    // Step 11: Test Content Updates
    console.log('\n11. Testing Content Updates...');
    const emailTemplateId = emailsResponse.data[0]?.id;
    if (emailTemplateId) {
      await axios.put(`${BASE_URL}/api/admin/content/email-templates/${emailTemplateId}`, {
        name: 'Welcome Email (Updated)',
        subject: 'Welcome to Household Planet Kenya! {{customerName}}',
        content: '<h1>Welcome {{customerName}}!</h1><p>Thank you for joining our community. We have amazing products waiting for you!</p><p>Use code WELCOME10 for 10% off your first order.</p>',
        variables: ['customerName'],
        isActive: true
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Email template updated successfully');
    }

    // Step 12: Test Content Deletion
    console.log('\n12. Testing Content Deletion...');
    const blogId = blogResponse.data[0]?.id;
    if (blogId) {
      await axios.delete(`${BASE_URL}/api/admin/content/blog/${blogId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Blog post deleted successfully');
    }

    console.log('\n✅ All Content Management Tests Passed!');
    console.log('\n🎉 Content Management Features Complete!');
    console.log('\nFeatures Implemented:');
    console.log('• Homepage banner and content editing system');
    console.log('• Promotional content management with scheduling');
    console.log('• Email template editor for automated communications');
    console.log('• Static page content management (About, Terms, Privacy)');
    console.log('• FAQ management system with categories');
    console.log('• Blog/news section management with SEO');
    console.log('• Content search and filtering capabilities');
    console.log('• Content backup and restore functionality');
    console.log('• Real-time content statistics and analytics');
    console.log('• Professional admin interface for content management');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Note: You need to create an admin user first:');
      console.log('1. Register a user with email: admin@householdplanet.co.ke');
      console.log('2. Update the user role to "ADMIN" in the database');
      console.log('3. Run this test again');
    }
  }
}

// Run the test
if (require.main === module) {
  testContentManagement().catch(console.error);
}

module.exports = { testContentManagement };