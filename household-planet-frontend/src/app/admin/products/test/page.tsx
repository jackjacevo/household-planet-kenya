'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

export default function AdminProductsTestPage() {
  const [status, setStatus] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setStatus('Testing API endpoints...');
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setStatus('❌ No token found. Please login first.');
        return;
      }

      // Test products endpoint
      const productsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(productsResponse.data.data);
      setStatus(prev => prev + '\n✅ Products API working');

      // Test categories endpoint
      const categoriesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(categoriesResponse.data);
      setStatus(prev => prev + '\n✅ Categories API working');

      setStatus(prev => prev + '\n🎉 All tests passed!');
    } catch (error) {
      console.error('Test error:', error);
      setStatus(prev => prev + `\n❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestProduct = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const testProduct = {
        name: 'Test Product ' + Date.now(),
        slug: 'test-product-' + Date.now(),
        description: 'This is a test product created from the admin panel',
        sku: 'TEST-' + Date.now(),
        price: 1000,
        categoryId: categories[0]?.id || 1,
        isActive: true,
        isFeatured: false,
        images: [],
        tags: ['test']
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`,
        testProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus(prev => prev + `\n✅ Created test product: ${response.data.name}`);
      testAPI(); // Refresh the products list
    } catch (error) {
      setStatus(prev => prev + `\n❌ Failed to create product: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Products Test Page</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={testAPI} disabled={loading}>
            Test API Endpoints
          </Button>
          <Button onClick={createTestProduct} disabled={loading || categories.length === 0}>
            Create Test Product
          </Button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="whitespace-pre-wrap text-sm">{status || 'Click "Test API Endpoints" to start'}</pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Products ({products.length})</h3>
            <div className="bg-white border rounded-lg max-h-64 overflow-y-auto">
              {products.map((product: any) => (
                <div key={product.id} className="p-3 border-b">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    SKU: {product.sku} | Price: KSh {product.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Categories ({categories.length})</h3>
            <div className="bg-white border rounded-lg max-h-64 overflow-y-auto">
              {categories.map((category: any) => (
                <div key={category.id} className="p-3 border-b">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-gray-600">
                    ID: {category.id} | Products: {category._count?.products || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
