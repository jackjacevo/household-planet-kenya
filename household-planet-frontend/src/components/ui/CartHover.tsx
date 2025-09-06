'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/contexts/ToastContext';
import { getImageUrl } from '@/lib/imageUtils';

interface CartHoverProps {
  children: React.ReactNode;
}

export function CartHover({ children }: CartHoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { items, removeFromCart, getTotalPrice } = useCart();
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

  const handleRemoveFromCart = (item: any) => {
    removeFromCart(item.id);
    showToast({
      variant: 'info',
      title: 'Removed from Cart 🗑️',
      description: `${item.product.name} has been removed from your cart`,
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
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Shopping Cart</h3>
            
            {items.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 sm:space-x-3">
                      <Image
                        src={getImageUrl(item.product.images?.[0])}
                        alt={item.product.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × Ksh {item.product.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromCart(item);
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
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <span className="font-semibold text-sm sm:text-base">Total:</span>
                    <span className="font-bold text-green-600 text-sm sm:text-base">
                      Ksh {getTotalPrice().toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href="/cart"
                    className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    View Cart
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