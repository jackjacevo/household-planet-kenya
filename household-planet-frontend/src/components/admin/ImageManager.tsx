'use client';

import { useState, useRef } from 'react';
import { Upload, X, Crop, Download, RotateCw, ZoomIn, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

interface ImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  productId?: number;
  maxImages?: number;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageManager({ images, onImagesChange, productId, maxImages = 10 }: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, width: 100, height: 100 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length || images.length >= maxImages) return;
    
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      // Validate file type and size
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return; // 5MB limit
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId || 'temp'}/images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Handle the response format from the backend
      const uploadedImages = response.data.images || [];
      const newImages = [...images, ...uploadedImages];
      onImagesChange(newImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    if (!productId) {
      // For new products, just remove from local state
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}/images/${index}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const cropImage = async () => {
    if (selectedImageIndex === null) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/images/crop`,
        {
          imageUrl: images[selectedImageIndex],
          cropData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newImages = [...images];
      newImages[selectedImageIndex] = response.data.imageUrl;
      onImagesChange(newImages);
      setCropMode(false);
      setSelectedImageIndex(null);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const optimizeImages = async () => {
    if (!productId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${productId}/images/optimize`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onImagesChange(response.data.images);
    } catch (error) {
      console.error('Error optimizing images:', error);
    }
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || images.length >= maxImages}
            >
              {uploading ? 'Uploading...' : 'Upload Images'}
            </Button>
            {images.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={optimizeImages}
                disabled={!productId}
              >
                <ZoomIn className="h-4 w-4 mr-2" />
                Optimize All
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Upload up to {maxImages} images. Max 5MB each. Supports JPG, PNG, WebP.
          </p>
          <p className="text-xs text-gray-400">
            {images.length}/{maxImages} images uploaded
          </p>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group border rounded-lg overflow-hidden bg-gray-50"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                reorderImages(fromIndex, index);
              }}
            >
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              
              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setCropMode(true);
                  }}
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  <Crop className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeImage(index)}
                  className="bg-white text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crop Modal */}
      {cropMode && selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
            
            <div className="relative mb-4">
              <img
                src={images[selectedImageIndex]}
                alt="Crop preview"
                className="max-w-full h-auto"
              />
              
              {/* Crop overlay would go here - simplified for this example */}
              <div className="absolute inset-0 border-2 border-dashed border-blue-500 opacity-50" />
            </div>

            {/* Crop Controls */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">X Position</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cropData.x}
                  onChange={(e) => setCropData(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Y Position</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cropData.y}
                  onChange={(e) => setCropData(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Width</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cropData.width}
                  onChange={(e) => setCropData(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cropData.height}
                  onChange={(e) => setCropData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCropMode(false);
                  setSelectedImageIndex(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={cropImage}>
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
