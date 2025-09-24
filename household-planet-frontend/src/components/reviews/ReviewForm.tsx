'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Star, Camera, X, Upload, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  productId: number;
  onSubmit: (review: any) => void;
}

export function ReviewForm({ productId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files).slice(0, 3 - photos.length);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      setError('Please log in to submit a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('productId', productId.toString());
      formData.append('rating', rating.toString());
      if (comment.trim()) {
        formData.append('comment', comment.trim());
      }
      
      // Append photos with proper field name
      photos.forEach((photo, index) => {
        formData.append('images', photo);
      });

      console.log('Submitting review with data:', {
        productId,
        rating,
        comment: comment.trim(),
        photosCount: photos.length
      });

      await onSubmit(formData);
      
      // Reset form
      setRating(0);
      setComment('');
      setPhotos([]);
      setError(null);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
        <div className="text-center py-8">
          <LogIn className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Please log in to write a review</p>
          <Button
            onClick={() => router.push('/login')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`h-6 w-6 md:h-8 md:w-8 transition-colors ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm md:text-base"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
          
          <div className="flex space-x-3 mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center space-x-2 text-sm"
            >
              <Camera className="h-4 w-4" />
              <span>Camera</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 text-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Gallery</span>
            </Button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={(e) => handlePhotoUpload(e.target.files)}
            className="hidden"
          />
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handlePhotoUpload(e.target.files)}
            className="hidden"
          />

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-20 md:h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            Upload up to 3 photos. Max 5MB each.
          </p>
        </div>

        <Button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
}
