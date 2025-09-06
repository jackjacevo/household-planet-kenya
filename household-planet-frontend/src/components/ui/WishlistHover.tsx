'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, X } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/contexts/ToastContext';
import { getImageUrl } from '@/lib/imageUtils';

interface WishlistHoverProps {
  children: React.ReactNode;
}

export function WishlistHover({ children }: WishlistHoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { items, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => setIsOpen(false), 200);
    setTimeoutId(id);
  };

  const handleRemoveFromWishlist = (item: any) => {
    removeFromWishlist(item.id);
    showToast({
      variant: 'info',
      title: 'Removed from Wishlist 💔',
      description: `${item.name} has been removed from your wishlist`,
    });
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isOpen && (
        <div 
          className="absolute left-1/2 sm:right-0 sm:left-auto top-full mt-2 w-[calc(100vw-2rem)] max-w-72 sm:w-80 bg-white rounded-lg shadow-xl border z-50 -translate-x-1/2 sm:translate-x-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-3 sm:p-4">
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Wishlist</h3>
            
            {items.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm">Your wishlist is empty</p>
            ) : (
              <>
                <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 sm:space-x-3">
                      <Image
                        src={getImageUrl(item.images?.[0])}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ksh {item.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(item);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 sm:p-0"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{items.length - 3} more items
                    </p>
                  )}
                </div>
                
                <div className="border-t pt-2 sm:pt-3 mt-2 sm:mt-3">
                  <Link
                    href="/wishlist"
                    className="block w-full bg-red-500 text-white text-center py-2 rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    View Wishlist
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}