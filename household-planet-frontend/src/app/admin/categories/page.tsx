'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderOpen, Folder, Tag, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { secureApiClient } from '@/lib/secure-api';
import { useToast } from '@/contexts/ToastContext';

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
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    isActive: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await secureApiClient.get('/api/categories');
      
      const responseData = response.data;
      let categoriesData = [];
      
      if (responseData.categories && Array.isArray(responseData.categories)) {
        categoriesData = responseData.categories;
      } else if (Array.isArray(responseData)) {
        categoriesData = responseData;
      }
      
      const safeCategoriesData = categoriesData.map((cat: any) => ({
        ...cat,
        _count: cat._count || { products: 0 },
        children: cat.children || []
      }));
      
      setCategories(safeCategoriesData);
    } catch (error: any) {
      showToast({ type: 'error', message: 'Failed to load categories' });
      setCategories([]);
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

  const validateCategoryFile = (file: File): string | null => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
      'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/x-icon'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return `"${file.name}" is not supported. Allowed formats: JPG, PNG, WebP, GIF, BMP, TIFF, SVG, ICO.`;
    }
    
    if (file.size > maxSize) {
      return `"${file.name}" is too large. Maximum file size is 5MB.`;
    }
    
    return null;
  };

  const handleImageUpload = async (file: File) => {
    // Validate file before upload
    const validationError = validateCategoryFile(file);
    if (validationError) {
      showToast({ type: 'error', message: validationError });
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await secureApiClient.post('/api/admin/categories/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = response.data.url;
      setFormData(prev => ({ ...prev, image: imageUrl }));
      showToast({ type: 'success', message: 'Image uploaded successfully' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      showToast({ type: 'error', message: errorMessage.includes('Only') ? errorMessage : 'Failed to upload image. Please try again.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast({ type: 'error', message: 'Category name is required' });
      return;
    }

    try {
      setLoading(true);
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
        await secureApiClient.put(`/api/admin/categories/${editingCategory.id}`, data);
        showToast({ type: 'success', message: 'Category updated successfully' });
      } else {
        await secureApiClient.post('/api/admin/categories', data);
        showToast({ type: 'success', message: 'Category created successfully' });
      }

      await fetchCategories();
      resetForm();
    } catch (error: any) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to save category' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await secureApiClient.delete(`/api/admin/categories/${category.id}`);
      showToast({ type: 'success', message: `Category "${category.name}" deleted successfully` });
      await fetchCategories();
    } catch (error: any) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete category' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', image: '', parentId: '', isActive: true });
    setEditingCategory(null);
    setShowForm(false);
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
  };

  const parentCategories = categories.filter(cat => !cat.parentId);
  const getSubcategories = (parentId: number) => categories.filter(cat => cat.parentId === parentId);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            {parentCategories.length} parent categories, {categories.filter(cat => cat.parentId).length} subcategories
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {showForm && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            zIndex: 9999 
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" 
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value, image: e.target.value ? '' : prev.image }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">No Parent (Main Category)</option>
                  {parentCategories.filter(c => c.id !== editingCategory?.id).map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              {!formData.parentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/svg+xml,image/x-icon"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                          e.target.value = ''; // Clear input after processing
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || uploadingImage}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: JPG, PNG, WebP, GIF, BMP, TIFF, SVG, ICO • Max size: 5MB
                    </p>
                    
                    {uploadingImage && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Loading image...
                      </div>
                    )}
                    
                    {formData.image && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={(() => {
                            if (formData.image.startsWith('http')) return formData.image;
                            if (formData.image.startsWith('/')) return `${process.env.NEXT_PUBLIC_API_URL}${formData.image}`;
                            return `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/image/${formData.image}`;
                          })()} 
                          alt="Category preview" 
                          className="h-16 w-16 object-cover rounded-lg border border-gray-200" 
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Image uploaded</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="mt-1 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={loading}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No categories found. Create your first category to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {parentCategories.map((parentCategory) => {
            const subcategories = getSubcategories(parentCategory.id);
            
            return (
              <div key={parentCategory.id} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {/* Parent Category Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {parentCategory.image ? (
                        <img 
                          src={(() => {
                            if (parentCategory.image.startsWith('http')) return parentCategory.image;
                            if (parentCategory.image.startsWith('/')) return `${process.env.NEXT_PUBLIC_API_URL}${parentCategory.image}`;
                            return `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/image/${parentCategory.image}`;
                          })()} 
                          alt={parentCategory.name}
                          className="h-12 w-12 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
                          <FolderOpen className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">{parentCategory.name}</h3>
                        <p className="text-sm text-blue-700">{parentCategory.description}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {subcategories.length} subcategories
                          </span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {parentCategory._count?.products || 0} products
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        parentCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {parentCategory.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setFormData({ name: '', slug: '', description: '', image: '', parentId: parentCategory.id.toString(), isActive: true });
                          setEditingCategory(null);
                          setShowForm(true);
                        }}
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(parentCategory)} className="bg-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(parentCategory)}
                        className="bg-white text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="inline-flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 border border-gray-200 group transition-colors">
                          {subcategory.image ? (
                            <img 
                              src={(() => {
                                if (subcategory.image.startsWith('http')) return subcategory.image;
                                if (subcategory.image.startsWith('/')) return `${process.env.NEXT_PUBLIC_API_URL}${subcategory.image}`;
                                return `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/image/${subcategory.image}`;
                              })()} 
                              alt={subcategory.name}
                              className="h-5 w-5 object-cover rounded mr-2"
                            />
                          ) : (
                            <Folder className="h-4 w-4 text-gray-500 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-700 mr-2">{subcategory.name}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full mr-2 ${
                            subcategory.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {subcategory.isActive ? '✓' : '✗'}
                          </span>
                          <span className="text-xs text-gray-500 mr-2">({subcategory._count?.products || 0})</span>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(subcategory)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(subcategory)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {subcategories.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm mb-2">No subcategories yet</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setFormData({ name: '', slug: '', description: '', image: '', parentId: parentCategory.id.toString(), isActive: true });
                        setEditingCategory(null);
                        setShowForm(true);
                      }}
                      className="text-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Subcategory
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}