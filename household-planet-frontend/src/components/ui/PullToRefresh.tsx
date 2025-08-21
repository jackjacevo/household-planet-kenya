'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    if (disabled || window.scrollY > 0) return;
    setIsPulling(true);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled || window.scrollY > 0 || !isPulling) return;
    
    const distance = Math.max(0, info.offset.y);
    setPullDistance(Math.min(distance, threshold * 1.5));
  };

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (disabled || !isPulling) return;
    
    setIsPulling(false);
    
    if (info.offset.y >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull to Refresh Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-green-50 border-b border-green-100 z-10"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isPulling || isRefreshing ? Math.max(pullDistance, isRefreshing ? 60 : 0) : 0,
          opacity: isPulling || isRefreshing ? 1 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col items-center justify-center py-2">
          <motion.div
            animate={{ 
              rotate: isRefreshing ? 360 : pullProgress * 180,
              scale: Math.max(0.8, pullProgress)
            }}
            transition={{ 
              rotate: isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }
            }}
            className={`p-2 rounded-full ${
              shouldTrigger ? 'bg-green-500 text-white' : 'bg-green-200 text-green-600'
            }`}
          >
            <RefreshCw className="h-5 w-5" />
          </motion.div>
          <motion.p
            className="text-sm text-green-600 mt-1"
            animate={{ opacity: pullDistance > 20 ? 1 : 0 }}
          >
            {isRefreshing 
              ? 'Refreshing...' 
              : shouldTrigger 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </motion.p>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ 
          y: isPulling ? pullDistance : isRefreshing ? 60 : 0 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}