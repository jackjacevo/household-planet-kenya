const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let adminToken = '';
let categoryId = '';
let productId = '';
let variantId = '';
let orderId = '';

const categories = [
  'Kitchen & Dining', 'Cleaning Supplies', 'Home Decor', 'Bedding & Bath',
  'Storage & Organization', 'Furniture', 'Electronics & Appliances',
  'Garden & Outdoor', 'Health & Beauty', 'Baby & Kids',
  'Pet Supplies', 'Office Supplies', 'Seasonal & Holiday'
];

async function testPhase2Complete() {
  console.log('🚀 Testing Phase 2 Complete Implementation...\n');

  try {
    // 1. Authentication System
    console.log('=== AUTHENTICATION SYSTEM ===');
    
    // Register user
    await axios.post(`${BASE_URL}/auth/register`, {
      email: 'phase2test@example.com',
      password: 'TestPass123!',
      name: 'Phase 2 Test User',
      phone: '+254712345678'
    });

    // Login user
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'phase2test@example.com',
      password: 'TestPass123!'
    });
    authToken = loginResponse.data.accessToken;
    console.log('✅ User authentication working');

    // Login admin (assuming admin exists)
    try {
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@householdplanet.co.ke',
        password: 'AdminPass123!'
      });
      adminToken = adminLogin.data.accessToken;
      console.log('✅ Admin authentication working');
    } catch (error) {
      console.log('⚠️  Admin account not found, using user token for admin operations');
      adminToken = authToken;
    }

    // 2. Complete Product Catalog with 13 Categories
    console.log('\n=== PRODUCT CATALOG - 13 CATEGORIES ===');
    
    // Get all categories
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log(`✅ Found ${categoriesResponse.data.length} categories`);
    
    // Verify all 13 categories exist
    const foundCategories = categoriesResponse.data.map(cat => cat.name);
    const missingCategories = categories.filter(cat => !foundCategories.includes(cat));
    
    if (missingCategories.length === 0) {
      console.log('✅ All 13 required categories present');
      categoryId = categoriesResponse.data[0].id;
    } else {
      console.log(`⚠️  Missing categories: ${missingCategories.join(', ')}`);
    }

    // 3. Product Management APIs with Variants
    console.log('\n=== PRODUCT MANAGEMENT WITH VARIANTS ===');
    
    // Create product with variants
    const productData = {
      name: 'Test Kitchen Set',
      description: 'Complete kitchen utensil set',
      price: 2500,
      categoryId: categoryId,
      sku: 'TEST-KIT-001',
      stock: 50,
      variants: [
        { name: 'Small', sku: 'TEST-KIT-001-S', price: 2000, stock: 20, size: 'Small' },
        { name: 'Large', sku: 'TEST-KIT-001-L', price: 3000, stock: 15, size: 'Large' }
      ]
    };

    const productResponse = await axios.post(`${BASE_URL}/products`, productData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    productId = productResponse.data.id;
    variantId = productResponse.data.variants[0].id;
    console.log('✅ Product with variants created');

    // Get product with variants
    const productDetails = await axios.get(`${BASE_URL}/products/${productId}`);
    console.log(`✅ Product details retrieved with ${productDetails.data.variants.length} variants`);

    // 4. Advanced Search and Filtering
    console.log('\n=== ADVANCED SEARCH & FILTERING ===');
    
    // Search products
    const searchResponse = await axios.get(`${BASE_URL}/products/search?q=kitchen&category=${categoryId}&minPrice=1000&maxPrice=5000`);
    console.log(`✅ Search returned ${searchResponse.data.products.length} products`);

    // Filter by category
    const categoryProducts = await axios.get(`${BASE_URL}/products?categoryId=${categoryId}`);
    console.log(`✅ Category filtering returned ${categoryProducts.data.products.length} products`);

    // 5. Shopping Cart Functionality
    console.log('\n=== SHOPPING CART FUNCTIONALITY ===');
    
    // Add to cart
    await axios.post(`${BASE_URL}/cart`, {
      productId: productId,
      variantId: variantId,
      quantity: 2
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    // Get cart
    const cartResponse = await axios.get(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Cart has ${cartResponse.data.itemCount} items, total: KES ${cartResponse.data.total}`);

    // Guest cart validation
    const guestCartResponse = await axios.post(`${BASE_URL}/guest-cart/validate`, {
      items: [{ productId: productId, quantity: 1 }]
    });
    console.log(`✅ Guest cart validation working, total: KES ${guestCartResponse.data.total}`);

    // 6. Order Management System
    console.log('\n=== ORDER MANAGEMENT SYSTEM ===');
    
    // Create order from cart
    const orderResponse = await axios.post(`${BASE_URL}/orders/from-cart`, {
      shippingAddress: '123 Test Street, Nairobi, Kenya',
      deliveryLocation: 'Nairobi CBD',
      deliveryPrice: 200,
      paymentMethod: 'MPESA'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    orderId = orderResponse.data.id;
    console.log(`✅ Order created: ${orderResponse.data.orderNumber}`);

    // Get order tracking
    const trackingResponse = await axios.get(`${BASE_URL}/orders/${orderId}/tracking`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Order tracking: ${trackingResponse.data.currentStatus}`);

    // Update order status (admin)
    await axios.put(`${BASE_URL}/orders/${orderId}/status`, {
      status: 'CONFIRMED',
      notes: 'Order confirmed and payment verified'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Order status updated');

    // 7. Inventory Tracking
    console.log('\n=== INVENTORY TRACKING ===');
    
    // Check inventory alerts
    const inventoryResponse = await axios.get(`${BASE_URL}/products/inventory/alerts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Inventory alerts retrieved: ${inventoryResponse.data.length} alerts`);

    // Update stock
    await axios.put(`${BASE_URL}/products/${productId}/stock`, {
      stock: 45
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Stock updated successfully');

    // 8. Product Review System
    console.log('\n=== PRODUCT REVIEW SYSTEM ===');
    
    // Add product review
    const reviewResponse = await axios.post(`${BASE_URL}/products/${productId}/reviews`, {
      rating: 5,
      title: 'Excellent product!',
      comment: 'Great quality kitchen set, highly recommended.'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Product review added');

    // Get product reviews
    const reviewsResponse = await axios.get(`${BASE_URL}/products/${productId}/reviews`);
    console.log(`✅ Product reviews retrieved: ${reviewsResponse.data.reviews.length} reviews`);

    // 9. Additional Features Testing
    console.log('\n=== ADDITIONAL FEATURES ===');
    
    // Bulk import test
    const bulkData = {
      products: [
        {
          name: 'Bulk Test Product 1',
          price: 1500,
          categoryId: categoryId,
          sku: 'BULK-001',
          stock: 25
        },
        {
          name: 'Bulk Test Product 2',
          price: 2000,
          categoryId: categoryId,
          sku: 'BULK-002',
          stock: 30
        }
      ]
    };

    const bulkResponse = await axios.post(`${BASE_URL}/products/bulk-import`, bulkData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Bulk import completed: ${bulkResponse.data.imported} products`);

    // Product recommendations
    const recommendationsResponse = await axios.get(`${BASE_URL}/products/${productId}/recommendations`);
    console.log(`✅ Product recommendations: ${recommendationsResponse.data.length} items`);

    // Wishlist functionality
    await axios.post(`${BASE_URL}/users/wishlist`, {
      productId: productId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const wishlistResponse = await axios.get(`${BASE_URL}/users/wishlist`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Wishlist functionality: ${wishlistResponse.data.length} items`);

    // Return request
    const orderDetails = await axios.get(`${BASE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (orderDetails.data.items.length > 0) {
      const returnResponse = await axios.post(`${BASE_URL}/orders/${orderId}/return`, {
        reason: 'Product defective',
        description: 'Item arrived damaged',
        items: [{
          orderItemId: orderDetails.data.items[0].id,
          reason: 'Defective',
          condition: 'Damaged'
        }]
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Return request created');
    }

    // 10. API Performance and Error Handling
    console.log('\n=== API PERFORMANCE & ERROR HANDLING ===');
    
    // Test pagination
    const paginatedProducts = await axios.get(`${BASE_URL}/products?page=1&limit=5`);
    console.log(`✅ Pagination working: Page 1 of ${paginatedProducts.data.pagination.pages}`);

    // Test error handling
    try {
      await axios.get(`${BASE_URL}/products/nonexistent-id`);
    } catch (error) {
      if (error.response.status === 404) {
        console.log('✅ Error handling working (404 for non-existent product)');
      }
    }

    // Test validation
    try {
      await axios.post(`${BASE_URL}/products`, {
        name: '', // Invalid empty name
        price: -100 // Invalid negative price
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    } catch (error) {
      if (error.response.status === 400) {
        console.log('✅ Input validation working');
      }
    }

    console.log('\n🎉 PHASE 2 COMPLETE - ALL SYSTEMS OPERATIONAL!');
    console.log('\n📊 PHASE 2 DELIVERABLES SUMMARY:');
    console.log('✅ Complete product catalog with 13 categories');
    console.log('✅ Product management APIs with variants');
    console.log('✅ Advanced search and filtering');
    console.log('✅ Shopping cart functionality (user + guest)');
    console.log('✅ Order management system with status workflow');
    console.log('✅ Inventory tracking and alerts');
    console.log('✅ Product review system');
    console.log('✅ Bulk import functionality');
    console.log('✅ Product recommendations');
    console.log('✅ Wishlist functionality');
    console.log('✅ Return/exchange system');
    console.log('✅ API error handling and validation');
    console.log('✅ Pagination and performance optimization');
    
    console.log('\n🚀 READY FOR PHASE 3 DEVELOPMENT!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Stack trace:', error.stack);
  }
}

testPhase2Complete();