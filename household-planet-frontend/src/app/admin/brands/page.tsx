'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  _count: { products: number };
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    isActive: true
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';
      
      // Try to fetch from backend first
      try {
        const response = await axios.get(`${apiUrl}/api/brands`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        
        const responseData = response.data;
        if (Array.isArray(responseData)) {
          const brandObjects = responseData.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            logo: item.logo,
            isActive: item.isActive !== false,
            _count: item._count || { products: 0 }
          }));
          setBrands(brandObjects);
          return;
        }
      } catch (apiError) {
        console.warn('Brands API failed, using fallback data');
      }
      
      // Fallback data
      setBrands([
        { id: 1, name: 'Samsung', slug: 'samsung', isActive: true, _count: { products: 5 } },
        { id: 2, name: 'LG', slug: 'lg', isActive: true, _count: { products: 3 } },
        { id: 3, name: 'Sony', slug: 'sony', isActive: true, _count: { products: 2 } },
        { id: 4, name: 'Philips', slug: 'philips', isActive: true, _count: { products: 4 } },
        { id: 5, name: 'Panasonic', slug: 'panasonic', isActive: true, _count: { products: 1 } }
      ]);
      setError('Using demo brands - API unavailable');
      
      const responseData = response.data;
      if (Array.isArray(responseData)) {
        const brandObjects = responseData.map((item: any, index: number) => {
          if (typeof item === 'string') {
            return {
              id: index + 1,
              name: item,
              slug: item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              isActive: true,
              _count: { products: 0 }
            };
          }
          return {
            id: item.id || index + 1,
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            logo: item.logo,
            isActive: item.isActive !== false,
            _count: item._count || { products: 0 }
          };
        });
        setBrands(brandObjects);
      } else {
        setBrands([]);
      }
    } catch (error: any) {
      console.warn('Brand fetch failed, using fallback');
      setBrands([]);
      setError('Brands temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(prev.name) || !prev.slug ? generateSlug(name) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Brand name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';
      const data = {
        ...formData,
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name),
        logo: formData.logo.trim() || null
      };

      // Try to save to backend first
      try {
        if (editingBrand) {
          await axios.put(`${apiUrl}/api/brands/${editingBrand.id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          });
          setSuccess('Brand updated successfully');
        } else {
          await axios.post(`${apiUrl}/api/brands`, data, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          });
          setSuccess('Brand created successfully');
        }
        await fetchBrands();
      } catch (apiError) {
        console.warn('Brand save API failed, updating locally');
        // Fallback to local update
        if (editingBrand) {
          setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...b, ...data } : b));
          setSuccess('Brand updated (local only)');
        } else {
          const newBrand = { id: Date.now(), ...data, _count: { products: 0 } };
          setBrands(prev => [...prev, newBrand]);
          setSuccess('Brand created (local only)');
        }
      }
      resetForm();
    } catch (error: any) {
      setError('Failed to save brand - API unavailable');
      console.error('Error saving brand:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    const productCount = brand._count?.products || 0;
    if (productCount > 0) {
      setError(`Cannot delete brand "${brand.name}" because it has ${productCount} products. Please move or delete the products first.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';
      
      // Try to delete from backend first
      try {
        await axios.delete(`${apiUrl}/api/brands/${brand.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        setSuccess('Brand deleted successfully');
        await fetchBrands();
      } catch (apiError) {
        console.warn('Brand delete API failed, updating locally');
        setBrands(prev => prev.filter(b => b.id !== brand.id));
        setSuccess('Brand deleted (local only)');
      }
    } catch (error: any) {
      setError('Failed to delete brand - API unavailable');
      console.error('Error deleting brand:', error);
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', logo: '', isActive: true });
    setEditingBrand(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (brand: Brand) => {
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
      isActive: brand.isActive
    });
    setEditingBrand(brand);
    setShowForm(true);
    setError(null);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage product brands</p>
        </div>
        <Button onClick={() => { setShowForm(true); clearMessages(); }} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={clearMessages} className="ml-auto text-red-400 hover:text-red-600">
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <button onClick={clearMessages} className="ml-auto text-green-400 hover:text-green-600">
              ×
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-w-2xl w-full mx-4 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingBrand ? 'Edit Brand' : 'Add Brand'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                  disabled={loading}
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the brand "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={loading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-contain" />
                  ) : (
                    <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                  <div className="text-sm text-gray-500">{brand.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {brand._count.products}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    brand.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(brand)}
                    disabled={loading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setDeleteConfirm(brand)}
                    disabled={loading || brand._count.products > 0}
                    className={brand._count.products > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-600'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
