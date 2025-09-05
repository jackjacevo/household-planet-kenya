'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import RichTextEditor from './RichTextEditor';
import ImageManager from './ImageManager';
import VariantManager from './VariantManager';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { generateSlug } from '@/lib/slug';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  comparePrice: z.number().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional().nullable(),
  categoryId: z.number().min(1, 'Category is required'),
  brandId: z.number().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  tags: z.array(z.string()).default([])
});

type ProductFormData = z.infer<typeof productSchema>;

interface EnhancedProductFormProps {
  product?: any;
  onSubmit: (data: ProductFormData & { images: string[]; variants: any[] }) => void;
  onCancel: () => void;
}

export default function EnhancedProductForm({ product, onSubmit, onCancel }: EnhancedProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [variants, setVariants] = useState(product?.variants || []);
  const [description, setDescription] = useState(product?.description || '');
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || '');
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      isActive: true,
      isFeatured: false,
      tags: []
    }
  });

  const watchedTags = watch('tags') || [];
  const watchedName = watch('name') || '';

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (product) {
      const formData = {
        ...product,
        brandId: product.brandId ? Number(product.brandId) : ''
      };
      reset(formData);
      setImages(product.images || []);
      setVariants(product.variants || []);
      setDescription(product.description || '');
      setShortDescription(product.shortDescription || '');
    }
  }, [product, reset]);

  useEffect(() => {
    // Auto-generate slug from name when creating new product
    if (watchedName && !product) {
      const slug = generateSlug(watchedName);
      setValue('slug', slug);
    }
  }, [watchedName, setValue, product]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands`, {
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

  const generateSEOSuggestions = async () => {
    if (!product?.id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${product.id}/seo-suggestions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setValue('seoTitle', response.data.seoTitle);
      setValue('seoDescription', response.data.seoDescription);
      setValue('metaKeywords', response.data.metaKeywords);
    } catch (error) {
      console.error('Error generating SEO suggestions:', error);
    }
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      await onSubmit({ 
        ...data, 
        description,
        shortDescription,
        images, 
        variants 
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'description', label: 'Description', icon: '📄' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'variants', label: 'Variants', icon: '🔧' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  if (previewMode) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Product Preview</h2>
          <Button onClick={() => setPreviewMode(false)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {images.length > 0 && (
                <img src={images[0]} alt={watchedName} className="w-full h-64 object-cover rounded-lg" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">{watchedName}</h1>
              <div className="text-2xl font-bold text-green-600 mb-4">
                KSh {watch('price')?.toLocaleString()}
              </div>
              <div dangerouslySetInnerHTML={{ __html: shortDescription }} className="mb-4" />
              <div dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
        <div className="flex gap-2">
          <Button onClick={() => setPreviewMode(true)} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                  <input
                    {...register('slug')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated from product name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from product name</p>
                  {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                  <input
                    {...register('sku')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PROD-001"
                  />
                  {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSh) *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    {...register('categoryId', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    {...register('brandId')}
                    value={watch('brandId') || ''}
                    onChange={(e) => setValue('brandId', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand: any) => (
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
              </div>

              <div className="flex gap-6">
                <label className="flex items-center">
                  <input type="checkbox" {...register('isActive')} className="mr-2" />
                  Active
                </label>
                <label className="flex items-center">
                  <input type="checkbox" {...register('isFeatured')} className="mr-2" />
                  Featured
                </label>
              </div>
            </div>
          )}

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                <RichTextEditor
                  value={shortDescription}
                  onChange={setShortDescription}
                  placeholder="Enter a brief product description..."
                  height="150px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter detailed product description..."
                  height="400px"
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
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <ImageManager
              images={images}
              onImagesChange={setImages}
              productId={product?.id}
              maxImages={10}
            />
          )}

          {/* Variants Tab */}
          {activeTab === 'variants' && (
            <VariantManager
              productId={product?.id}
              variants={variants}
              onVariantsChange={setVariants}
            />
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">SEO Settings</h3>
                {product?.id && (
                  <Button type="button" onClick={generateSEOSuggestions} variant="outline">
                    Generate Suggestions
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                <input
                  {...register('seoTitle')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO optimized title"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                <textarea
                  {...register('seoDescription')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO meta description"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                <input
                  {...register('metaKeywords')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
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
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag) => (
                    <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-blue-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  );
}