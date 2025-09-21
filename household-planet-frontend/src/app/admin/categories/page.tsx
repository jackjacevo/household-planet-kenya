'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderOpen, Folder, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      showToast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive'
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive'
      });
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
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editingCategory.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast({
          title: 'Success',
          description: 'Category updated successfully',
          variant: 'success'
        });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast({
          title: 'Success',
          description: 'Category created successfully',
          variant: 'success'
        });
      }

      await fetchCategories();
      resetForm();
    } catch (error: any) {
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save category',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${category.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast({
        title: 'Success',
        description: `Category "${category.name}" deleted successfully`,
        variant: 'success'
      });
      await fetchCategories();
    } catch (error: any) {
      showToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete category',
        variant: 'destructive'
      });
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            {parentCategories.length} parent categories, {categories.filter(cat => cat.parentId).length} subcategories
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Parent Category
          </Button>
          <Button 
            onClick={() => { 
              setFormData({ name: '', slug: '', description: '', image: '', parentId: parentCategories[0]?.id.toString() || '', isActive: true });
              setEditingCategory(null);
              setShowForm(true);
            }} 
            disabled={loading || parentCategories.length === 0}
            variant="outline"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subcategory
          </Button>
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Edit Category' : formData.parentId ? 'Add Subcategory' : 'Add Parent Category'}
              </h3>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">No Parent (Main Category)</option>
                  {parentCategories.filter(c => c.id !== editingCategory?.id).map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
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

      {/* Categories Display */}
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
        <div className="space-y-6">
          {parentCategories.map((parentCategory) => {
            const subcategories = getSubcategories(parentCategory.id);
            return (
              <div key={parentCategory.id} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Parent Category Header */}
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">{parentCategory.name}</h3>
                        <p className="text-sm text-blue-600">{parentCategory.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        parentCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {parentCategory.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {subcategories.length} subcategories
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(parentCategory)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(parentCategory)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Folder className="h-4 w-4 text-gray-500" />
                              <h4 className="font-medium text-gray-900">{subcategory.name}</h4>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              subcategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {subcategory.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{subcategory.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {subcategory._count?.products || 0} products
                            </span>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(subcategory)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDelete(subcategory)}
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {subcategories.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <p className="text-sm">No subcategories yet.</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setFormData({ name: '', slug: '', description: '', image: '', parentId: parentCategory.id.toString(), isActive: true });
                        setEditingCategory(null);
                        setShowForm(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subcategory
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