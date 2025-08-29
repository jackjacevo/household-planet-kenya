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
import { useToast } from '@/hooks/useToast';

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
  const { toast } = useToast();
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
        toast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
          variant: 'destructive'
        });
      } else {
        toast({
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
        toast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
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
      toast({
        title: 'Success!',
        description: 'Product created successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response?.status === 401) {
        toast({
          title: 'Authentication Error',
          description: 'Please login again to continue.',
          variant: 'destructive'
        });
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;
    try {
      console.log('Updating product with data:', productData);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${editingProduct.id}`,
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Product update response:', response.data);
      fetchProducts();
      setEditingProduct(null);
      setShowForm(false);
      toast({
        title: 'Success!',
        description: 'Product updated successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
      toast({
        title: 'Success!',
        description: 'Product deleted successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive'
      });
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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your product catalog and inventory.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAnalytics(true)} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{meta.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Products</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.trackStock && p.stock <= p.lowStockThreshold && p.stock > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <select
            value={filters.brandId}
            onChange={(e) => setFilters(prev => ({ ...prev, brandId: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select
            value={filters.limit}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
          <Button onClick={() => setFilters({ search: '', categoryId: '', brandId: '', isActive: '', page: 1, limit: 10 })} variant="outline">
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
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className={selectedProducts.includes(product.id) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded object-cover"
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    KSh {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StockStatus
                      stock={product.stock}
                      lowStockThreshold={product.lowStockThreshold}
                      trackStock={product.trackStock}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="text-xs">
                      <div>Reviews: {product.reviewCount}</div>
                      <div>Sales: {product.salesCount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setViewingProduct(product)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingProduct(product);
                      setShowForm(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          {viewingProduct && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-xl font-bold">{viewingProduct.name}</DialogTitle>
                  <Button size="sm" variant="outline" onClick={() => setViewingProduct(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Product Image */}
                <div className="flex justify-center">
                  <img
                    src={getImageUrl(viewingProduct.images[0])}
                    alt={viewingProduct.name}
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Product Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Price</h3>
                    <p className="text-lg font-bold text-green-600">KSh {viewingProduct.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Category</h3>
                    <p>{viewingProduct.category.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Brand</h3>
                    <p>{viewingProduct.brand?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Status</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      viewingProduct.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {viewingProduct.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Stock</h3>
                    <div className="flex items-center gap-2">
                      <StockStatus
                        stock={viewingProduct.stock}
                        lowStockThreshold={viewingProduct.lowStockThreshold}
                        trackStock={viewingProduct.trackStock}
                      />
                      <span className="text-sm text-gray-600">({viewingProduct.stock} units)</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Performance</h3>
                    <div className="text-sm">
                      <p>Reviews: {viewingProduct.reviewCount}</p>
                      <p>Sales: {viewingProduct.salesCount}</p>
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div>
                  <h3 className="font-semibold text-gray-700">Created</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(viewingProduct.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}