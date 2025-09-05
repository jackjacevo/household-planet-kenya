'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Eye, Search, Filter, BarChart3, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ProductForm from '@/components/admin/ProductForm';
import BulkActions from '@/components/admin/BulkActions';
import ProductAnalytics from '@/components/admin/ProductAnalytics';
import StockStatus from '@/components/admin/StockStatus';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getImageUrl } from '@/lib/imageUtils';
import axios from 'axios';
import { useToast } from '@/contexts/ToastContext';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  trackStock: boolean;
  isActive: boolean;
  images: string[];
  category: { name: string };
  brand?: { name: string };
  reviewCount: number;
  salesCount: number;
  createdAt: string;
}

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    brandId: '',
    isActive: '',
    page: 1,
    limit: 10
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const [categoriesRes, brandsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/brands`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      console.log('Fetching products with params:', params.toString());
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Products response:', response.data);
      setProducts(response.data.data || []);
      setMeta(response.data.meta || { total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        showToast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
          variant: 'destructive'
        });
      } else {
        showToast({
          title: 'Error',
          description: 'Failed to load products. Please refresh the page.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      console.log('Creating product with data:', productData);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate required fields
      if (!productData.name || !productData.categoryId || !productData.price) {
        showToast({
          title: 'Validation Error',
          description: 'Please fill in all required fields (name, category, price).',
          variant: 'destructive'
        });
        return;
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`,
        productData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Product creation response:', response.data);
      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      showToast({
        title: 'Success!',
        description: `Product "${productData.name}" created successfully`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response?.status === 401) {
        showToast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
          variant: 'destructive'
        });
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
        showToast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    console.log('AdminProductsPage: handleUpdateProduct called');
    console.log('AdminProductsPage: editingProduct:', editingProduct);
    console.log('AdminProductsPage: productData received:', productData);
    
    if (!editingProduct) {
      console.error('AdminProductsPage: No editing product found');
      showToast({
        title: 'Error',
        description: 'No product selected for editing.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      console.log('AdminProductsPage: Starting product update...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('AdminProductsPage: No token found');
        showToast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate required fields
      if (!productData.name || !productData.categoryId || !productData.price) {
        console.error('AdminProductsPage: Validation failed:', {
          name: productData.name,
          categoryId: productData.categoryId,
          price: productData.price
        });
        showToast({
          title: 'Validation Error',
          description: 'Please fill in all required fields (name, category, price).',
          variant: 'destructive'
        });
        return;
      }
      
      const updateUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${editingProduct.id}`;
      console.log('AdminProductsPage: Making PUT request to:', updateUrl);
      console.log('AdminProductsPage: Request payload:', productData);
      
      const response = await axios.put(
        updateUrl,
        productData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('AdminProductsPage: Product update response:', response.data);
      console.log('AdminProductsPage: Update successful, refreshing products...');
      
      await fetchProducts();
      setEditingProduct(null);
      setShowForm(false);
      
      console.log('AdminProductsPage: Showing success toast');
      showToast({
        title: 'Success!',
        description: `Product "${productData.name}" updated successfully`,
        variant: 'success'
      });
    } catch (error) {
      console.error('AdminProductsPage: Error updating product:', error);
      console.error('AdminProductsPage: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        showToast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
          variant: 'destructive'
        });
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update product';
        console.log('Full error response:', error.response?.data);
        showToast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    const productName = product?.name || 'Unknown Product';
    
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
          variant: 'destructive'
        });
        return;
      }
      
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProducts();
      showToast({
        title: 'Success!',
        description: `Product "${productName}" deleted successfully`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.response?.status === 401) {
        showToast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
          variant: 'destructive'
        });
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
        showToast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(products.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  if (showAnalytics) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Analytics</h1>
          <Button onClick={() => setShowAnalytics(false)} variant="outline">
            Back to Products
          </Button>
        </div>
        <ProductAnalytics />
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 lg:px-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-700">
            Manage your product catalog and inventory.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowAnalytics(true)} variant="outline" size="sm" className="w-full sm:w-auto">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowForm(true)} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-4 mb-6 sm:mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-3 sm:p-5">
            <div className="flex items-center">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{meta.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-3 sm:p-5">
            <div className="flex items-center">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Active Products</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-3 sm:p-5">
            <div className="flex items-center">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.trackStock && p.stock <= p.lowStockThreshold && p.stock > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-3 sm:p-5">
            <div className="flex items-center">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="pl-10 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value, page: 1 }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              value={filters.brandId}
              onChange={(e) => setFilters(prev => ({ ...prev, brandId: e.target.value, page: 1 }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value, page: 1 }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
          <Button 
            onClick={() => setFilters({ search: '', categoryId: '', brandId: '', isActive: '', page: 1, limit: 10 })} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedProducts={selectedProducts}
        onBulkUpdate={fetchProducts}
        onClearSelection={clearSelection}
      />

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Products</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedProducts.length === products.length && products.length > 0}
              onChange={selectedProducts.length === products.length ? clearSelection : selectAllProducts}
              className="rounded"
            />
            <span className="text-sm text-gray-500">Select All</span>
          </div>
        </div>
        
        <div className="admin-table-wrapper">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Performance
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className={selectedProducts.includes(product.id) ? 'bg-blue-50' : ''}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <img
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded object-cover"
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {product.brand?.name}
                        </div>
                        {/* Show category on mobile */}
                        <div className="text-xs text-gray-400 md:hidden">
                          {product.category.name}
                        </div>
                        {/* Show status on mobile */}
                        <div className="sm:hidden mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {product.category.name}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    KSh {product.price.toLocaleString()}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <StockStatus
                      stock={product.stock}
                      lowStockThreshold={product.lowStockThreshold}
                      trackStock={product.trackStock}
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    <div className="text-xs">
                      <div>Reviews: {product.reviewCount}</div>
                      <div>Sales: {product.salesCount}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button size="sm" variant="outline" onClick={() => setViewingProduct(product)} className="p-2">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          console.log('Editing product:', product);
                          setEditingProduct(product);
                          setShowForm(true);
                        }} 
                        className="p-2"
                        title="Edit product"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)} className="p-2">
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, meta.total)} of {meta.total} results
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={filters.page >= meta.totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details Dialog */}
      <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {viewingProduct && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-2xl font-bold">{viewingProduct.name}</DialogTitle>
                  <Button size="sm" variant="outline" onClick={() => setViewingProduct(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-8">
                {/* Product Images */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {viewingProduct.images?.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`${viewingProduct.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ))}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Pricing</h3>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600">KSh {viewingProduct.price?.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Category & Brand</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Category:</span> {viewingProduct.category?.name}</div>
                      <div><span className="font-medium">Brand:</span> {viewingProduct.brand?.name || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Stock Management */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Current Stock</div>
                      <div className="flex items-center gap-2 mt-1">
                        <StockStatus
                          stock={viewingProduct.stock}
                          lowStockThreshold={viewingProduct.lowStockThreshold}
                          trackStock={viewingProduct.trackStock}
                        />
                        <span className="font-semibold">{viewingProduct.stock} units</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Low Stock Threshold</div>
                      <div className="text-lg font-semibold mt-1">{viewingProduct.lowStockThreshold} units</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Stock Tracking</div>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          viewingProduct.trackStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {viewingProduct.trackStock ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Product Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Active:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          viewingProduct.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {viewingProduct.isActive ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Performance</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Reviews:</span> {viewingProduct.reviewCount || 0}</div>
                      <div><span className="font-medium">Sales:</span> {viewingProduct.salesCount || 0}</div>
                      <div><span className="font-medium">Created:</span> {new Date(viewingProduct.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}