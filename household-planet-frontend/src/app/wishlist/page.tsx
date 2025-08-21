'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <Link href={`/products/${item.slug}`}>
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              </Link>
              
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
              >
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              </button>
            </div>

            <div className="p-4">
              <Link href={`/products/${item.slug}`}>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
                  {item.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(item.price)}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => addToCart({
                    id: item.id,
                    productId: item.id,
                    quantity: 1,
                    product: item
                  })}
                  disabled={!item.stock || item.stock <= 0}
                  className="w-full"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => removeFromWishlist(item.id)}
                  className="w-full"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
