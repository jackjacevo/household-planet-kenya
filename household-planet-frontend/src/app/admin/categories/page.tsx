'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, AlertTriangle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import OptimizedThumbnail from '@/components/admin/OptimizedThumbnail';
import CategoryTableSkeleton from '@/components/admin/CategoryTableSkeleton';
import { preloadCategoryImages } from '@/lib/imageOptimization';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  isActive: boolean;
  sortOrder: number;
  parent?: Category;
  children: Category[];
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Preload images when categories change
  useEffect(() => {
    if (categories.length > 0) {
      preloadCategoryImages(categories);
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', error);
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
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const data = {
        ...formData,
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name),
        description: formData.description.trim() || null,
        image: formData.image.trim() || null,
        parentId: formData.parentId ? parseInt(formData.parentId) : null
      };

      if (editingCategory) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${editingCategory.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Category updated successfully');
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Category created successfully');
      }

      await fetchCategories();
      resetForm();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save category');
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (category._count.products > 0) {
      setError(`Cannot delete category "${category.name}" because it has ${category._count.products} products. Please move or delete the products first.`);
      return;
    }

    if (category.children.length > 0) {
      setError(`Cannot delete category "${category.name}" because it has subcategories. Please delete or move the subcategories first.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${category.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Category "${category.name}" deleted successfully`);
      await fetchCategories();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete category');
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', image: '', parentId: '', isActive: true });
    setEditingCategory(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      parentId: category.parentId?.toString() || '',
      isActive: category.isActive
    });
    setEditingCategory(category);
    setShowForm(true);
    setError(null);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/upload-image`,
        uploadFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      

      console.log('Setting image URL:', response.data.imageUrl);
      setFormData(prev => ({ ...prev, image: response.data.imageUrl }));
      setSuccess('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-2 text-sm text-gray-700">Organize your product categories</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setShowForm(true); clearMessages(); }} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Parent Category
          </Button>
          <Button 
            onClick={() => { 
              setFormData({ name: '', slug: '', description: '', image: '', parentId: '1', isActive: true });
              setEditingCategory(null);
              setShowForm(true);
              clearMessages();
            }} 
            disabled={loading}
            variant="outline"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subcategory
          </Button>
        </div>
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

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-2xl w-full mx-4 p-6 rounded-lg shadow-lg ${
            formData.parentId ? 'bg-blue-50 border border-blue-200' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-medium mb-4 ${
              formData.parentId ? 'text-blue-800' : 'text-gray-900'
            }`}>
              {editingCategory ? 'Edit Category' : formData.parentId ? 'Add Subcategory' : 'Add Parent Category'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">No Parent</option>
                  {categories.filter(c => c.id !== editingCategory?.id && !c.parentId).map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
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
                  {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
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
              Are you sure you want to delete the category "{deleteConfirm.name}"? This action cannot be undone.
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

      {/* Categories Table */}
      {loading && categories.length === 0 ? (
        <CategoryTableSkeleton />
      ) : categories.length === 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-8 text-center">
            <p className="text-gray-500">No categories found. Create your first category to get started.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories
                .filter(cat => !cat.parentId)
                .map((parentCategory) => [
                  <tr key={parentCategory.id} className={`${loading ? 'opacity-50' : ''} bg-blue-50`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OptimizedThumbnail
                        src={parentCategory.image}
                        alt={parentCategory.name}
                        size="md"
                        fallbackText={parentCategory.name.charAt(0)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-900">{parentCategory.name}</div>
                      <div className="text-sm text-blue-600">{parentCategory.slug}</div>
                      {parentCategory.description && (
                        <div className="text-xs text-blue-500 mt-1 truncate max-w-xs">{parentCategory.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                      Parent
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parentCategory._count.products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        parentCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {parentCategory.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(parentCategory)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setDeleteConfirm(parentCategory)}
                        disabled={loading || parentCategory._count.products > 0 || parentCategory.children.length > 0}
                        className={parentCategory._count.products > 0 || parentCategory.children.length > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-600'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>,
                  ...categories
                    .filter(cat => cat.parentId === parentCategory.id)
                    .map((subCategory) => (
                      <tr key={subCategory.id} className={loading ? 'opacity-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="ml-4">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="ml-4">
                            <OptimizedThumbnail
                              src={subCategory.image}
                              alt={subCategory.name}
                              size="sm"
                              fallbackText={subCategory.name.charAt(0)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="ml-6">
                            <div className="text-sm font-medium text-gray-700">↳ {subCategory.name}</div>
                            <div className="text-sm text-gray-500">{subCategory.slug}</div>
                            {subCategory.description && (
                              <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{subCategory.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Subcategory
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subCategory._count.products}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {subCategory.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(subCategory)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setDeleteConfirm(subCategory)}
                            disabled={loading || subCategory._count.products > 0}
                            className={subCategory._count.products > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-600'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                ]).flat()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}