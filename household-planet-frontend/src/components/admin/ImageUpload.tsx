'use client';

import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/lib/imageUtils';
import axios from 'axios';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]) => {
    const errors = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 5MB)`);
      }
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} is not a supported image format`);
      }
    }

    return errors;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || uploading) return;
    
    const newFiles = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = newFiles.slice(0, remainingSlots);
    
    if (filesToProcess.length === 0) {
      setUploadStatus({ type: 'error', message: 'Maximum number of images reached' });
      return;
    }

    // Validate files
    const validationErrors = validateFiles(filesToProcess);
    if (validationErrors.length > 0) {
      setUploadStatus({ type: 'error', message: validationErrors.join(', ') });
      return;
    }
    
    setUploading(true);
    setUploadStatus({ type: null, message: '' });
    
    try {
      const formData = new FormData();
      filesToProcess.forEach(file => {
        formData.append('images', file);
      });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }
      
      console.log('Uploading images to:', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/temp/images`);
      
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/temp/images`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000
          }
        );
        
        console.log('Upload response: Success');
        
        if ((response as any).data.success && (response as any).data.images) {
          onImagesChange([...images, ...(response as any).data.images]);
          setUploadStatus({ 
            type: 'success', 
            message: (response as any).data.message || `Successfully uploaded ${(response as any).data.images.length} image(s)` 
          });
        } else {
          throw new Error('Upload failed: Invalid response format');
        }
      } catch (apiError) {
        console.error('Image upload failed:', apiError);
        throw new Error('Upload failed. Please try again.');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus({ type: null, message: '' });
      }, 3000);
    } catch (error: any) {
      console.error('Error in image upload process:', error);
      // This should not happen now since we have fallback handling above
      setUploadStatus({ type: 'error', message: 'Unexpected error during image processing' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // If it's a temp image, try to delete it from server
    if (imageUrl && imageUrl.startsWith('/uploads/temp/')) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/temp/images`,
            {
              headers: { Authorization: `Bearer ${token}` },
              data: { imageUrl }
            }
          );
        }
      } catch (error) {
        console.warn('Failed to delete temp image from server:', error);
      }
    }
    
    // No blob URL cleanup needed - using file paths only
    
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {images.length === 0 ? 'Main Product Image' : 
         images.length === 1 ? 'Main Image + Additional Images' : 
         `Main Image + Additional Images (${images.length}/${maxImages})`}
      </label>
      
      {/* Status Messages */}
      {uploadStatus.type && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="text-sm">{uploadStatus.message}</span>
        </div>
      )}
      
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center">
            <Upload className={`h-12 w-12 mb-2 ${uploading ? 'text-gray-300' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600 mb-2">
              {uploading ? 'Uploading...' : (
                <>
                  Drag and drop images here, or{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    disabled={uploading}
                  >
                    browse
                  </button>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, JPEG, WebP up to 5MB each
            </p>
            {uploading && (
              <div className="mt-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={getImageUrl(image)}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load for index:', index);
                      e.currentTarget.src = '/images/products/placeholder.svg';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">
                  {index === 0 ? 'Main' : `Additional ${index}`}
                </div>
              </div>
            ))}
          </div>
          

        </div>
      )}
    </div>
  );
}
