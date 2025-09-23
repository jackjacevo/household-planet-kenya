'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ProductForm from '@/components/admin/ProductForm';
import { secureApiClient } from '@/lib/secure-api';
import { useToast } from '@/contexts/ToastContext';

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching admin products...');
      const response = await secureApiClient.get('/api/admin/products');
      
      const data = response.data;
      console.log('📦 Admin products response:', data);
      setProducts(data.products || data.data || data || []);
    } catch (error) {
      console.error('❌ Error fetching admin products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await secureApiClient.get('/api/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      const token = localStorage.getItem('token');
      console.log('📝 Creating product:', productData);
      const response = await secureApiClient.post('/api/admin/products', productData);
      
      console.log('✅ Product created:', response.data);
      showToast({ type: 'success', message: 'Product created successfully' });
      
      setShowForm(false);
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Product creation failed:', error.response?.data || error.message);
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to create product' });
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    try {
      const token = localStorage.getItem('token');
      console.log('📝 Updating product:', editingProduct.id, productData);
      const response = await secureApiClient.put(`/api/admin/products/${editingProduct.id}`, productData);
      
      console.log('✅ Product updated:', response.data);
      showToast({
        type: 'success',
        message: 'Product updated successfully'
      });
      
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Product update failed:', error.response?.data || error.message);
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update product'
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast({
          type: 'error',
          message: 'Authentication required'
        });
        return;
      }

      console.log('🗑️ Deleting product:', productId);
      await secureApiClient.delete(`/api/admin/products/${productId}`);
      
      showToast({
        type: 'success',
        message: 'Product deleted successfully'
      });
      
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Product deletion failed:', error);
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete product'
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast({
          type: 'error',
          message: 'Authentication required'
        });
        return;
      }

      await secureApiClient.post('/api/admin/products/bulk-delete', { productIds: selectedProducts });
      
      showToast({
        type: 'success',
        message: `${selectedProducts.length} products deleted successfully`
      });
      
      setSelectedProducts([]);
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Bulk deletion failed:', error);
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete products'
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive);
    const matchesCategory = categoryFilter === 'all' || product.categoryId === parseInt(categoryFilter);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.isActive).length,
    inactiveProducts: products.filter(p => !p.isActive).length,
    lowStockProducts: products.filter(p => p.stock <= p.lowStockThreshold).length,
    outOfStockProducts: products.filter(p => p.stock === 0).length,
    featuredProducts: products.filter(p => p.isFeatured).length
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

  return (
    <div className="px-2 sm:px-4 lg:px-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your product catalog ({products.length} {products.length === 1 ? 'product' : 'products'})
          </p>
        </div>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <Button 
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedProducts.length})
            </Button>
          )}
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.activeProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.inactiveProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.featuredProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Input
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Plus className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {products.length === 0 ? 'No products in your catalog' : 'No products match your filters'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {products.length === 0 
                  ? 'Start building your product catalog by adding your first product. You can add product details, images, pricing, and inventory information.'
                  : 'Try adjusting your search terms or filter criteria to find the products you\'re looking for.'
                }
              </p>
              {products.length === 0 && (
                <Button 
                  onClick={() => setShowForm(true)} 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Product
                </Button>
              )}
              {products.length > 0 && filteredProducts.length === 0 && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(filteredProducts.map(p => p.id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(prev => [...prev, product.id]);
                          } else {
                            setSelectedProducts(prev => prev.filter(id => id !== product.id));
                          }
                        }}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                            src={(() => {
                              const images = product.images;
                              if (Array.isArray(images) && images.length > 0) {
                                const imageName = images[0];
                                if (imageName.startsWith('http')) {
                                  return imageName;
                                }
                                return `${process.env.NEXT_PUBLIC_API_URL}/admin/products/image/${imageName}`;
                              }
                              return '/images/products/placeholder.svg';
                            })()}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.src = '/images/products/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </div>
                          {product.isFeatured && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {product.category?.name || 'Uncategorized'}
                      </div>
                      {product.brand && (
                        <div className="text-xs text-gray-500">
                          {product.brand.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        KSh {product.price?.toLocaleString()}
                      </div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          KSh {product.comparePrice.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm font-medium ${
                        (product.stock || 0) > product.lowStockThreshold ? 'text-green-600' : 
                        (product.stock || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {product.stock || 0}
                      </div>
                      {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                        <div className="text-xs text-yellow-600">Low Stock</div>
                      )}
                      {product.stock === 0 && (
                        <div className="text-xs text-red-600">Out of Stock</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteProduct(product.id);
                          }}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}