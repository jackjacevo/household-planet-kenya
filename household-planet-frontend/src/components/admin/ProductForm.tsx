'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Plus, X } from 'lucide-react';
import ImageUpload from './ImageUpload';
import AdminCategoryDropdown from './AdminCategoryDropdown';
import axios from 'axios';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional().refine(
    (val) => !val || val.trim().split(/\s+/).filter(word => word.length > 0).length <= 28,
    { message: 'Short description must not exceed 28 words' }
  ),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  comparePrice: z.number().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional().nullable(),
  categoryId: z.number().min(1, 'Category is required'),
  brandId: z.number().optional(),
  stock: z.number().min(0, 'Stock must be 0 or greater').default(0),
  lowStockThreshold: z.number().min(0, 'Low stock threshold must be 0 or greater').default(5),
  trackStock: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.array(z.string()).default([])
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  onSubmit: (data: ProductFormData & { images: string[] }) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: product?.sku || generateSKU(),
      stock: product?.stock || 0,
      lowStockThreshold: product?.lowStockThreshold || 5,
      trackStock: product?.trackStock !== false,
      isActive: product?.isActive !== false,
      isFeatured: product?.isFeatured || false,
      tags: product?.tags || []
    }
  });

  const watchedName = watch('name');

  useEffect(() => {
    if (watchedName && !product) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [watchedName, setValue, product]);

  function generateSKU() {
    return 'HP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const watchedTags = watch('tags') || [];

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (product) {
      // Properly populate form with product data
      const formData = {
        ...product,
        categoryId: Number(product.categoryId),
        brandId: product.brandId ? Number(product.brandId) : '',
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
        weight: product.weight ? Number(product.weight) : undefined,
        stock: Number(product.stock || 0),
        lowStockThreshold: Number(product.lowStockThreshold || 5),
        trackStock: Boolean(product.trackStock !== false),
        isActive: Boolean(product.isActive !== false),
        isFeatured: Boolean(product.isFeatured),
        tags: Array.isArray(product.tags) ? product.tags : []
      };
      reset(formData);
      setImages(Array.isArray(product.images) ? product.images : []);
    }
  }, [product, reset]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };



  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      const newTags = [...watchedTags, tagInput.trim()];
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', watchedTags.filter(t => t !== tag));
  };

  const handleFormSubmit = (data: ProductFormData) => {
    // Clean and validate data before submission
    const processedData: any = {
      name: data.name?.trim(),
      slug: data.slug?.trim(),
      description: data.description?.trim() || undefined,
      shortDescription: data.shortDescription?.trim() || undefined,
      sku: data.sku?.trim(),
      price: Number(data.price),
      categoryId: Number(data.categoryId),
      stock: Number(data.stock || 0),
      lowStockThreshold: Number(data.lowStockThreshold || 5),
      trackStock: Boolean(data.trackStock),
      isActive: Boolean(data.isActive),
      isFeatured: Boolean(data.isFeatured),
      images: images || [],
      tags: data.tags || []
    };
    
    // Only include optional fields if they have values
    if (data.comparePrice && Number(data.comparePrice) > 0) {
      processedData.comparePrice = Number(data.comparePrice);
    }
    if (data.weight && Number(data.weight) > 0) {
      processedData.weight = Number(data.weight);
    }
    if (data.brandId && Number(data.brandId) > 0) {
      processedData.brandId = Number(data.brandId);
    }
    if (data.dimensions?.trim()) {
      processedData.dimensions = data.dimensions.trim();
    }
    if (data.seoTitle?.trim()) {
      processedData.seoTitle = data.seoTitle.trim();
    }
    if (data.seoDescription?.trim()) {
      processedData.seoDescription = data.seoDescription.trim();
    }
    
    onSubmit(processedData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">{product ? 'Edit Product' : 'Add Product'}</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Debug info */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Form Validation Errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field}:</strong> {error?.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
            <input
              {...register('slug')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
            <div className="flex gap-2">
              <input
                {...register('sku')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly={!product}
              />
              {!product && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue('sku', generateSKU())}
                >
                  Generate
                </Button>
              )}
            </div>
            {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSh)</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compare Price (KSh)</label>
            <input
              type="number"
              step="0.01"
              {...register('comparePrice', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <AdminCategoryDropdown
              categories={categories}
              value={watch('categoryId') || ''}
              onChange={(categoryId) => setValue('categoryId', categoryId)}
              placeholder="Select Category"
            />
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <select
              {...register('brandId', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Brand</option>
              {brands.filter((brand: any) => brand.isActive).map((brand: any) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              {...register('weight', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
            <input
              type="text"
              {...register('dimensions')}
              placeholder="e.g., 30cm x 20cm x 15cm"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stock Management Section */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Stock Management</h3>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                {...register('trackStock')} 
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
              />
              <span className="text-sm font-medium text-gray-700">Enable Stock Tracking</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock Quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  {...register('stock', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">units</span>
                </div>
              </div>
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
              <p className="text-xs text-gray-500 mt-1">Total available quantity for sale</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Alert Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  {...register('lowStockThreshold', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="5"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 text-sm">units</span>
                </div>
              </div>
              {errors.lowStockThreshold && <p className="text-red-500 text-sm mt-1">{errors.lowStockThreshold.message}</p>}
              <p className="text-xs text-gray-500 mt-1">Get notified when stock falls below this level</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Stock Management Tips</h4>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Enable stock tracking to monitor inventory levels</li>
                    <li>Set appropriate low stock thresholds to avoid stockouts</li>
                    <li>Regular stock audits help maintain accuracy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
            <span className="text-xs text-gray-500 ml-2">
              ({watch('shortDescription') ? watch('shortDescription').trim().split(/\s+/).filter(word => word.length > 0).length : 0}/28 words)
            </span>
          </label>
          <textarea
            {...register('shortDescription')}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief product description (max 28 words)"
          />
          {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>}
        </div>

        {/* Images */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />
          <div className="mt-3 text-sm text-gray-600">
            <p>• Upload high-quality images for better customer experience</p>
            <p>• The first image will be used as the main product image</p>
            <p>• You can upload 1 main image + 4 additional images (5 total)</p>
            <p>• Supported formats: PNG, JPG, JPEG, WebP (max 5MB each)</p>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add tag"
            />
            <Button type="button" onClick={addTag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {watchedTags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-blue-600 hover:text-blue-800">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
            <input
              {...register('seoTitle')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
            <textarea
              {...register('seoDescription')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Status</h3>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input type="checkbox" {...register('isActive')} className="mr-2" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" {...register('isFeatured')} className="mr-2" />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {product ? 'Updating existing product' : 'Creating new product'}
            {isSubmitting && <span className="ml-2 text-blue-600">Processing...</span>}
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}