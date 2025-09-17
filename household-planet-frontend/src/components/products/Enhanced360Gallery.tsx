'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface Enhanced360GalleryProps {
  images360?: string[];
  productName: string;
  autoRotate?: boolean;
}

export function Enhanced360Gallery({ images360, productName, autoRotate = false }: Enhanced360GalleryProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  const totalFrames = images360?.length || 0;

  useEffect(() => {
    if (isRotating && totalFrames > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % totalFrames);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRotating, totalFrames]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (totalFrames <= 1) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setIsRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || totalFrames <= 1) return;
    
    const deltaX = e.clientX - startX;
    const sensitivity = 5;
    const frameChange = Math.floor(Math.abs(deltaX) / sensitivity);
    
    if (frameChange > 0) {
      const direction = deltaX > 0 ? 1 : -1;
      setCurrentFrame((prev) => {
        const newFrame = prev + (direction * frameChange);
        return ((newFrame % totalFrames) + totalFrames) % totalFrames;
      });
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleRotation = () => {
    setIsRotating(!isRotating);
  };

  if (!images360 || images360.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Image
          src={images360[currentFrame]}
          alt={`${productName} 360° view - frame ${currentFrame + 1}`}
          fill
          className="object-cover"
          priority
        />
        
        {/* 360° Indicator */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          360°
        </div>

        {/* Frame Counter */}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {currentFrame + 1} / {totalFrames}
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
          <button
            onClick={toggleRotation}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
          >
            {isRotating ? (
              <Pause className="h-4 w-4 text-gray-700" />
            ) : (
              <Play className="h-4 w-4 text-gray-700" />
            )}
          </button>
          
          <button
            onClick={() => setCurrentFrame(0)}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <motion.div
            className="h-full bg-orange-500"
            style={{ width: `${((currentFrame + 1) / totalFrames) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-gray-600 mt-2">
        Drag to rotate • Click play for auto-rotation
      </p>
    </div>
  );
}
