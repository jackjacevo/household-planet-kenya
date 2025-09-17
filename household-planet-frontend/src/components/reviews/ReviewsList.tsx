'use client';

import { Star } from 'lucide-react';
import { Review } from '@/types';
import { getImageUrl } from '@/lib/image-utils';

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">{review.user.name}</span>
                {review.isVerified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {review.title && (
            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
          )}

          {review.comment && (
            <p className="text-gray-700 text-sm md:text-base mb-4">{review.comment}</p>
          )}

          {review.images && (() => {
            try {
              const images = typeof review.images === 'string' ? JSON.parse(review.images) : review.images;
              return images && images.length > 0 && (
                <div className="flex space-x-2 mb-4 overflow-x-auto">
                  {images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`Review photo ${index + 1}`}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              );
            } catch (error) {
              return null;
            }
          })()}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button className="hover:text-gray-700">
              Helpful ({review.isHelpful || 0})
            </button>
            <button className="hover:text-gray-700">
              Report
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
