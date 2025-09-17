'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { SmartImage } from '@/components/ui/SmartImage';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { useImageOptimization } from '@/hooks/useImageOptimization';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const { preloadImages } = useImageOptimization();

  // Preload next/previous images for better UX
  useState(() => {
    if (images.length > 1) {
      const imagesToPreload = images.slice(0, 3);
      preloadImages(imagesToPreload);
    }
  });

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div>
        {/* Main Image */}
        <div className="relative aspect-square mb-4 group cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
          <ProgressiveImage
            src={images[selectedImage]}
            alt={productName}
            fill
            priority={selectedImage === 0}
            className="rounded-lg transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        
        {/* Thumbnails */}
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                selectedImage === index ? 'ring-2 ring-orange-500' : ''
              }`}
            >
              <SmartImage
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                quality={60}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className={`relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <SmartImage
                  src={images[selectedImage]}
                  alt={productName}
                  width={800}
                  height={800}
                  priority
                  quality={90}
                  className={`transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
              
              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}
              
              {/* Close Button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ImageGallery;
