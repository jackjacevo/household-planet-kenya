const axios = require('axios');

const API_BASE = 'https://householdplanetkenya.co.ke/api';

// Admin credentials
const ADMIN_EMAIL = 'admin@householdplanetkenya.co.ke';
const ADMIN_PASSWORD = 'HouseholdPlanet2024!';

const categories = [
  {
    name: 'Kitchen and Dining',
    description: 'Complete kitchen essentials and dining accessories for your home',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    subcategories: ['Cookware', 'Utensils', 'Dinnerware', 'Appliances', 'Storage']
  },
  {
    name: 'Bathroom Accessories',
    description: 'Essential bathroom items and accessories for comfort and style',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
    subcategories: ['Towels', 'Mats', 'Organizers', 'Fixtures', 'Decor']
  },
  {
    name: 'Cleaning and Laundry',
    description: 'Cleaning supplies and laundry essentials for a spotless home',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=300&fit=crop',
    subcategories: ['Cleaning Supplies', 'Tools', 'Laundry Accessories']
  },
  {
    name: 'Beddings and Bedroom Accessories',
    description: 'Comfortable bedding and bedroom essentials for better sleep',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    subcategories: ['Sheets', 'Comforters', 'Pillows', 'Mattress Protectors']
  },
  {
    name: 'Storage and Organization',
    description: 'Smart storage solutions to keep your home organized',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    subcategories: ['Containers', 'Shelving', 'Closet Organizers', 'Baskets']
  },
  {
    name: 'Home Decor and Accessories',
    description: 'Beautiful decor items to enhance your living space',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    subcategories: ['Wall Art', 'Decorative Items', 'Rugs', 'Curtains']
  },
  {
    name: 'Jewelry',
    description: 'Fashion jewelry and accessories for every occasion',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
    subcategories: ['Fashion Jewelry', 'Jewelry Boxes', 'Accessories']
  },
  {
    name: 'Humidifier, Candles and Aromatherapy',
    description: 'Create a relaxing atmosphere with aromatherapy essentials',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
    subcategories: ['Essential Oils', 'Diffusers', 'Scented Candles']
  },
  {
    name: 'Beauty and Cosmetics',
    description: 'Beauty products and cosmetics for your daily routine',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    subcategories: ['Skincare', 'Makeup', 'Tools', 'Mirrors']
  },
  {
    name: 'Home Appliances',
    description: 'Essential home appliances and kitchen gadgets',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    subcategories: ['Small Appliances', 'Kitchen Gadgets', 'Electronics']
  },
  {
    name: 'Furniture',
    description: 'Quality furniture for every room in your home',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    subcategories: ['Living Room', 'Bedroom', 'Dining', 'Office Furniture']
  },
  {
    name: 'Outdoor and Garden',
    description: 'Outdoor furniture and gardening essentials',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    subcategories: ['Patio Furniture', 'Garden Tools', 'Planters']
  },
  {
    name: 'Lighting and Electrical',
    description: 'Lighting solutions and electrical accessories',
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=300&fit=crop',
    subcategories: ['Lamps', 'Fixtures', 'Bulbs', 'Extension Cords']
  },
  {
    name: 'Bags and Belts',
    description: 'Stylish bags and belts for every occasion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    subcategories: ['Handbags & Purses', 'Backpacks', 'Travel & Luggage', 'Work & Professional Bags', 'Dress Belts', 'Casual Belts', 'Designer & Luxury Items']
  }
];

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function testEndpoints() {
  try {
    // Test different login endpoints
    const endpoints = [
      `${API_BASE}/auth/login`,
      `${API_BASE}/admin/auth/login`,
      `${API_BASE}/login`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await axios.post(endpoint, {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        });
        console.log(`✅ Success with ${endpoint}`);
        return response.data.access_token;
      } catch (error) {
        console.log(`❌ Failed ${endpoint}: ${error.response?.status || error.message}`);
      }
    }
    
    throw new Error('All login endpoints failed');
  } catch (error) {
    console.error('All endpoints failed:', error.message);
    throw error;
  }
}

async function clearExistingCategories(token) {
  try {
    const response = await axios.get(`${API_BASE}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const existingCategories = response.data;
    console.log(`Found ${existingCategories.length} existing categories`);
    
    // Delete all existing categories (children first, then parents)
    const children = existingCategories.filter(cat => cat.parentId);
    const parents = existingCategories.filter(cat => !cat.parentId);
    
    // Delete children first
    for (const category of children) {
      try {
        await axios.delete(`${API_BASE}/admin/categories/${category.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Deleted child category: ${category.name}`);
      } catch (error) {
        console.log(`Could not delete child ${category.name}:`, error.response?.data?.message || error.message);
      }
    }
    
    // Then delete parents
    for (const category of parents) {
      try {
        await axios.delete(`${API_BASE}/admin/categories/${category.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Deleted parent category: ${category.name}`);
      } catch (error) {
        console.log(`Could not delete parent ${category.name}:`, error.response?.data?.message || error.message);
      }
    }
  } catch (error) {
    console.error('Error clearing categories:', error.response?.data || error.message);
  }
}

async function createCategories(token) {
  const createdParents = [];
  
  // Create parent categories first
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    try {
      const parentData = {
        name: category.name,
        slug: generateSlug(category.name),
        description: category.description,
        image: category.image,
        isActive: true,
        sortOrder: i + 1
      };
      
      const response = await axios.post(`${API_BASE}/admin/categories`, parentData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      createdParents.push({
        ...response.data,
        subcategories: category.subcategories
      });
      
      console.log(`✅ Created parent category: ${category.name}`);
    } catch (error) {
      console.error(`❌ Failed to create parent ${category.name}:`, error.response?.data || error.message);
    }
  }
  
  // Wait a bit before creating subcategories
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create subcategories
  for (const parent of createdParents) {
    for (let j = 0; j < parent.subcategories.length; j++) {
      const subName = parent.subcategories[j];
      try {
        const subData = {
          name: subName,
          slug: generateSlug(subName),
          description: `${subName} in ${parent.name}`,
          parentId: parent.id,
          isActive: true,
          sortOrder: j + 1
        };
        
        await axios.post(`${API_BASE}/admin/categories`, subData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Created subcategory: ${subName} under ${parent.name}`);
      } catch (error) {
        console.error(`❌ Failed to create subcategory ${subName}:`, error.response?.data || error.message);
      }
    }
  }
}

async function updateProductionCategories() {
  try {
    console.log('🔐 Testing login endpoints...');
    const token = await testEndpoints();
    
    console.log('🗑️ Clearing existing categories...');
    await clearExistingCategories(token);
    
    console.log('📦 Creating new category structure...');
    await createCategories(token);
    
    console.log('✅ Categories updated successfully!');
    console.log('Visit https://householdplanetkenya.co.ke/admin/categories to verify');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    console.log('\n📝 Manual Instructions:');
    console.log('1. Go to https://householdplanetkenya.co.ke/admin/categories');
    console.log('2. Delete all existing categories');
    console.log('3. Create these 14 parent categories with images:');
    categories.forEach((cat, i) => {
      console.log(`   ${i+1}. ${cat.name}`);
      console.log(`      Image: ${cat.image}`);
      console.log(`      Subcategories: ${cat.subcategories.join(', ')}`);
    });
  }
}

updateProductionCategories();