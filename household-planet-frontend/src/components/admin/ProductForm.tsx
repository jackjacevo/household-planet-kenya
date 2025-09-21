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
      comparePrice: 0,
      categoryId: '',
      brandId: '',
      stock: 0,
      lowStockThreshold: 5,
      weight: 0,
      dimensions: '',
      description: '',
      shortDescription: '',
      tags: '',
      isActive: true,
      trackStock: true,
      isFeatured: false,
      isOnSale: false
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
        comparePrice: product.comparePrice || 0,
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        stock: product.stock || 0,
        lowStockThreshold: product.lowStockThreshold || 5,
        weight: product.weight || 0,
        dimensions: product.dimensions || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        isActive: product.isActive !== false,
        trackStock: product.trackStock !== false,
        isFeatured: product.isFeatured || false,
        isOnSale: product.isOnSale || false
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
    if (!files || files.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/upload/product`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        return response.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
      
      showToast({
        title: 'Success',
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
        variant: 'success'
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      showToast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload images',
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
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        sku: product ? data.sku : generateSKU(),
        price: Number(data.price),
        comparePrice: Number(data.comparePrice || 0),
        categoryId: Number(data.categoryId),
        brandId: data.brandId ? Number(data.brandId) : null,
        stock: Number(data.stock || 0),
        lowStockThreshold: Number(data.lowStockThreshold || 5),
        weight: Number(data.weight || 0),
        dimensions: data.dimensions?.trim() || null,
        shortDescription: data.shortDescription?.trim() || null,
        description: data.description?.trim() || null,
        trackStock: Boolean(data.trackStock),
        isActive: Boolean(data.isActive),
        isFeatured: Boolean(data.isFeatured),
        isOnSale: Boolean(data.isOnSale),
        images: images,
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Compare Price (KSh)</label>
            <input
              type="number"
              step="0.01"
              {...register('comparePrice')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">Original price for sale items</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
            <input
              type="number"
              min="0"
              {...register('lowStockThreshold')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              {...register('weight')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
            <input
              {...register('dimensions')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="L x W x H (cm)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
          <textarea
            {...register('shortDescription', { maxLength: { value: 28, message: 'Short description must be 28 characters or less' } })}
            rows={2}
            maxLength={28}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief product summary (max 28 chars)"
          />
          {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>}
          <p className="text-xs text-gray-500 mt-1">{watch('shortDescription')?.length || 0}/28 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed product description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <input
            {...register('tags')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Separate tags with commas (e.g., kitchen, appliance, modern)"
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('isFeatured')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Featured</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('isOnSale')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">On Sale</span>
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
