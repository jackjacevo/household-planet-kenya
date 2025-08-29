'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || uploading) return;
    
    const newFiles = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = newFiles.slice(0, remainingSlots);
    
    if (filesToProcess.length === 0) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      filesToProcess.forEach(file => {
        formData.append('images', file);
      });
      
      const token = localStorage.getItem('token');
      console.log('Uploading images to:', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/temp/images`);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/temp/images`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Upload response:', response.data);
      
      if (response.data.success && response.data.images) {
        onImagesChange([...images, ...response.data.images]);
      } else {
        throw new Error('Upload failed: Invalid response format');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      console.error('Error details:', error.response?.data);
      
      // Show user-friendly error message
      alert(`Failed to upload images: ${error.response?.data?.message || error.message}`);
      
      // Fallback to local preview URLs if upload fails
      const newImageUrls = filesToProcess.map(file => URL.createObjectURL(file));
      onImagesChange([...images, ...newImageUrls]);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const imageUrl = images[index];
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    
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
        Product Images ({images.length}/{maxImages})
      </label>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop images here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, JPEG up to 5MB each
          </p>
          {uploading && (
            <p className="text-xs text-blue-600 mt-1">
              Uploading images...
            </p>
          )}
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(image)}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', getImageUrl(image));
                      e.currentTarget.src = '/images/products/placeholder.svg';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  {index === 0 ? 'Main' : `${index + 1}`}
                </div>
              </div>
            ))}
          </div>
          
          {images.length < maxImages && (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full"
              disabled={uploading}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add More Images
            </Button>
          )}
        </div>
      )}
      

    </div>
  );
}