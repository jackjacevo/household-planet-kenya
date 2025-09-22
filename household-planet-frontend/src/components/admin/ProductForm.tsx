'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, X, Image as ImageIcon } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/brands`, {
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

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append all files to FormData for batch upload
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
        
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/products`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const uploadedUrls = response.data.images || [];
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
    } finally {
      setUploading(false);
    }
  };

  const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
        
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/product`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const uploadedUrl = response.data.url;
      setImages(prev => {
        const newImages = [...prev];
        newImages[targetIndex] = uploadedUrl;
        return newImages;
      });
      
      showToast({
        title: 'Success',
        description: `Image ${targetIndex + 1} uploaded successfully`,
        variant: 'success'
      });
    } catch (error: any) {
      console.error('Single image upload error:', error);
      showToast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = undefined;
      return newImages.filter(img => img !== undefined);
    });
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

    const validImages = images.filter(img => img);
    if (validImages.length === 0) {
      showToast({
        title: 'Validation Error',
        description: 'At least one product image is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: data.name.trim(),
        sku: product ? data.sku : generateSKU(),
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        categoryId: parseInt(data.categoryId),
        brandId: data.brandId ? parseInt(data.brandId) : null,
        stock: parseInt(data.stock || 0),
        lowStockThreshold: parseInt(data.lowStockThreshold || 5),
        weight: data.weight ? parseFloat(data.weight) : null,
        dimensions: data.dimensions?.trim() || null,
        shortDescription: data.shortDescription?.trim() || null,
        description: data.description?.trim() || null,
        trackStock: Boolean(data.trackStock),
        isActive: Boolean(data.isActive),
        isFeatured: Boolean(data.isFeatured),
        isOnSale: Boolean(data.isOnSale),
        images: images.filter(img => img),
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []
      };

      console.log('📝 Submitting product data:', productData);
      await onSubmit(productData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {product ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-blue-100 mt-1">
                  {product ? 'Update your product information' : 'Create a new product for your store'}
                </p>
              </div>
              <Button variant="outline" onClick={onCancel} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Product Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      SKU
                    </label>
                    <input
                      {...register('sku')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 shadow-sm"
                      placeholder="Auto-generated"
                      readOnly={!product}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Price (KSh) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price', { required: 'Price is required', min: 0.01 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="0.00"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Compare Price (KSh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('comparePrice')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Original price for sale items</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category *
                    </label>
                    <select
                      {...register('categoryId', { required: 'Category is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
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
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Brand
                    </label>
                    <select
                      {...register('brandId')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Inventory & Pricing */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4 text-green-600" />
                  </div>
                  Inventory & Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      {...register('stock')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="0"
                      {...register('lowStockThreshold')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('weight')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Dimensions</label>
                    <input
                      {...register('dimensions')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="L x W x H (cm)"
                    />
                  </div>
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

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">Product Images</label>
            <p className="text-sm text-gray-600 mb-4">Upload up to 5 high-quality images. The first image will be the main product image.</p>
            
            {/* Image Upload Grid */}
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="relative">
                  {images[index] ? (
                    <div className="relative group">
                      <img
                        src={images[index]}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Main Image
                        </div>
                      )}
                      {index > 0 && (
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                          #{index + 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center group">
                        <div className="text-center">
                          {index === 0 ? (
                            <>
                              <ImageIcon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              <span className="mt-2 block text-xs font-medium text-gray-600 group-hover:text-blue-600">
                                Main Image
                              </span>
                            </>
                          ) : (
                            <>
                              <Plus className="mx-auto h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              <span className="mt-1 block text-xs text-gray-500 group-hover:text-blue-600">
                                Image {index + 1}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/webp,image/gif"
                        onChange={(e) => handleSingleImageUpload(e, index)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Status */}
            {uploading && (
              <div className="mt-4 flex items-center justify-center py-4">
                <div className="inline-flex items-center px-6 py-3 font-semibold text-sm shadow-lg rounded-xl text-blue-600 bg-blue-50 border border-blue-200">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading image...
                </div>
              </div>
            )}

            {/* Upload Instructions */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Image Guidelines</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Upload up to 5 high-quality images (PNG, JPG, JPEG, WebP)</li>
                    <li>• Maximum file size: 5MB per image</li>
                    <li>• First image will be the main product image on your store</li>
                    <li>• Additional images will appear in the product gallery</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
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

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="px-8 py-3 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                  {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
