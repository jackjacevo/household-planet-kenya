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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8">
            Save your favorite products to view them here!
          </p>
          <Link href="/products">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item, index) => {
          const product = item.product || item;
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
  );
}
