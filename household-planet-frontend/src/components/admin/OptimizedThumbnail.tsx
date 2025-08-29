'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OptimizedThumbnailProps {
  src?: string;
  alt: string;
  size: 'sm' | 'md' | 'lg';
  fallbackText?: string;
  className?: string;
}

const sizeConfig = {
  sm: { width: 32, height: 32, sizes: '32px' },
  md: { width: 40, height: 40, sizes: '40px' },
  lg: { width: 128, height: 128, sizes: '128px' }
};

export default function OptimizedThumbnail({ 
  src, 
  alt, 
  size, 
  fallbackText, 
  className = '' 
}: OptimizedThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const config = sizeConfig[size];
  const fallback = fallbackText || alt.charAt(0).toUpperCase();

  if (!src || imageError) {
    return (
      <div 
        className={`bg-gray-200 rounded flex items-center justify-center ${className}`}
        style={{ width: config.width, height: config.height }}
      >
        <span className="text-xs text-gray-500 font-medium">
          {fallback}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded overflow-hidden ${className}`}
      style={{ width: config.width, height: config.height }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={config.sizes}
        className="object-cover"
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}