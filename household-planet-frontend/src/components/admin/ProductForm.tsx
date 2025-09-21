'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/contexts/ToastContext';

interface ProductFormProps {
  product?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      categoryId: '',
      brandId: '',
      stock: 0,
      description: '',
      isActive: true,
      trackStock: true
    }
  });

  function generateSKU() {
    return 'HP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (product) {
      reset({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price || 0,
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        stock: product.stock || 0,
        description: product.description || '',
        isActive: product.isActive !== false,
        trackStock: product.trackStock !== false
      });
      setImages(product.images || []);
    } else {
      setValue('sku', generateSKU());
    }
  }, [product, reset, setValue]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.categories || response.data || []);
    } catch (error) {
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(response.data || []);
    } catch (error) {
      setBrands([]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setImages(prev => [...prev, ...response.data.urls]);
    } catch (error) {
      showToast({
        title: 'Upload Failed',
        description: 'Failed to upload images',
        variant: 'destructive'
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: any) => {
    if (!data.name?.trim()) {
      showToast({
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!data.categoryId) {
      showToast({
        title: 'Validation Error',
        description: 'Category is required',
        variant: 'destructive'
      });
      return;
    }

    if (!data.price || data.price <= 0) {
      showToast({
        title: 'Validation Error',
        description: 'Valid price is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...data,
        name: data.name.trim(),
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: product ? data.sku : generateSKU(),
        price: Number(data.price),
        categoryId: Number(data.categoryId),
        brandId: data.brandId ? Number(data.brandId) : null,
        stock: Number(data.stock || 0),
        lowStockThreshold: 5,
        trackStock: Boolean(data.trackStock),
        isActive: Boolean(data.isActive),
        isFeatured: false,
        images: images,
        tags: []
      };

      await onSubmit(productData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
            <input
              {...register('sku')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="Auto-generated"
              readOnly={!product}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSh) *</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'Price is required', min: 0.01 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              {...register('categoryId', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <select
              {...register('brandId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
            <input
              type="number"
              min="0"
              {...register('stock')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Product description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload images
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
          
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('trackStock')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Track Stock</span>
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
