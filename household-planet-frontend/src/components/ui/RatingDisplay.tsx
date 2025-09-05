'use client';

import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function RatingDisplay({ 
  rating = 0, 
  reviewCount = 0, 
  size = 'md', 
  showText = true,
  className = '' 
}: RatingDisplayProps) {
  const formatRating = (rating: number, count: number) => {
    if (count === 0) return '0 (0 reviews)';
    return `${rating.toFixed(1)} (${count} review${count === 1 ? '' : 's'})`;
  };

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < Math.floor(rating) ? 'fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className={`text-gray-500 ml-2 ${textSizeClasses[size]}`}>
          {formatRating(rating, reviewCount)}
        </span>
      )}
    </div>
  );
}