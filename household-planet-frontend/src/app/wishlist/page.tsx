'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';

import Link from 'next/link';
import { useEffect } from 'react';

export default function WishlistPage() {
  const { items, wishlistData, syncWithBackend } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Only sync if we don't have local items or if it's the first load
      const hasLocalItems = items.length > 0;
      if (!hasLocalItems) {
        syncWithBackend();
      }
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/20 w-full">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-8 sm:py-16">
          <div className="text-center">
            <div className="bg-gradient-to-r from-pink-400 to-rose-600 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8 text-sm sm:text-base">
              Save your favorite products to view them here!
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/20 w-full">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">My Wishlist ({items.length})</h1>
        
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item, index) => {
            const product = item || item;
            return (
              <div key={product.id} className="relative">
                <ProductCard 
                  product={product} 
                  viewMode="grid" 
                  priority={index < 4}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
