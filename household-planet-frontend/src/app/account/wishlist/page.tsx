'use client';

import { useState, useEffect } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';
import { toastMessages } from '@/lib/toast-messages';
import { Heart, ShoppingCart, Bell, BellOff, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AccountWishlistPage() {
  const { items, removeFromWishlist, syncWithBackend } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeWishlist = async () => {
      try {
        // Load notification preferences
        const savedNotifications = localStorage.getItem('wishlist-notifications');
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
        
        // Sync with backend if user is authenticated
        const token = localStorage.getItem('token');
        if (token) {
          await syncWithBackend();
        }
      } catch (error) {
        console.error('Error initializing wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeWishlist();
  }, [syncWithBackend]);

  const handleNotificationToggle = (productId: string) => {
    const newNotifications = {
      ...notifications,
      [productId]: !notifications[productId]
    };
    setNotifications(newNotifications);
    localStorage.setItem('wishlist-notifications', JSON.stringify(newNotifications));
  };

  const addToCartFromWishlist = async (item: any) => {
    const wasAdded = await addToCart({
      id: `${item.id}-default`,
      productId: item.id,
      quantity: 1,
      product: item
    });
    
    if (wasAdded) {
      showToast(toastMessages.cart.added(item.name));
    } else {
      showToast(toastMessages.cart.alreadyExists(item.name));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8">
            Save your favorite products to view them here and get notified when they're back in stock or on sale!
          </p>
          <Link href="/products">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <div className="text-sm text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.filter(item => item && item.id && item.name).map((item) => (
            <div key={item.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <Link href={`/products/${item.slug || item.id}`}>
                  <div className="aspect-square relative">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/products/placeholder.svg';
                      }}
                    />
                  </div>
                </Link>
                
                <div className="absolute top-2 right-2 flex flex-col space-y-2">
                  <button
                    onClick={() => handleNotificationToggle(item.id.toString())}
                    className={`p-2 rounded-full transition-colors ${
                      notifications[item.id.toString()]
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                    title={notifications[item.id] ? 'Notifications enabled' : 'Enable notifications'}
                  >
                    {notifications[item.id.toString()] ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      removeFromWishlist(item.id);
                      showToast(toastMessages.wishlist.removed(item.name));
                    }}
                    className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    title="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </button>
                </div>

                {(!item.stock || item.stock === 0) && (
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}

                {(item.comparePrice && item.comparePrice > item.price) && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      On Sale
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <Link href={`/products/${item.slug || item.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {(item.comparePrice && item.comparePrice > item.price) ? (
                      <>
                        <span className="text-lg font-bold text-orange-600">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.comparePrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                  
                  {item.averageRating && (
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">{item.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => addToCartFromWishlist(item)}
                    disabled={!item.stock || item.stock === 0}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {(item.stock && item.stock > 0) ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        removeFromWishlist(item.id);
                        showToast(toastMessages.wishlist.removed(item.name));
                      }}
                      className="flex-1 text-red-600 hover:bg-red-50"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    
                    <Link href={`/products/${item.slug || item.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                {notifications[item.id.toString()] && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-xs text-blue-700">
                      <Bell className="h-3 w-3 mr-1" />
                      You'll be notified about price changes and stock updates
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Wishlist Tips</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Enable notifications to get alerts when items go on sale or come back in stock</li>
            <li>• Share your wishlist with friends and family for gift ideas</li>
            <li>• Items in your wishlist are saved across all your devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
