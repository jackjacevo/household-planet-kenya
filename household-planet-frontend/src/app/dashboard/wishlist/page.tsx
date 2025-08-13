'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useCart } from '../../../contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiShoppingCart, FiTrash2, FiBell, FiBellOff } from 'react-icons/fi';

interface WishlistItem {
  id: string;
  productId: string;
  notifyOnStock: boolean;
  notifyOnSale: boolean;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
    stock: number;
    isActive: boolean;
  };
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/users/wishlist');
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await api.delete(`/users/wishlist/${productId}`);
      setWishlistItems(items => items.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      alert('Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
      alert('Item added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  const toggleNotification = async (productId: string, type: 'stock' | 'sale', currentValue: boolean) => {
    try {
      const updateData = type === 'stock' 
        ? { notifyOnStock: !currentValue }
        : { notifyOnSale: !currentValue };
      
      await api.patch(`/users/wishlist/${productId}`, updateData);
      
      setWishlistItems(items => 
        items.map(item => 
          item.productId === productId 
            ? { ...item, ...updateData }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      alert('Failed to update notification settings');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow text-center py-12">
            <FiHeart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save items you love to buy them later</p>
            <Link href="/products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden group">
                <div className="relative">
                  <Link href={`/products/${item.product.slug}`}>
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                      <Image
                        src={item.product.images[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </Link>
                  
                  {/* Stock Status */}
                  {item.product.stock === 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">
                      KES {item.product.price.toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => toggleNotification(item.product.id, 'stock', item.notifyOnStock)}
                        className={`p-1 rounded ${
                          item.notifyOnStock 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={item.notifyOnStock ? 'Disable stock notifications' : 'Enable stock notifications'}
                      >
                        {item.notifyOnStock ? <FiBell className="h-4 w-4" /> : <FiBellOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleAddToCart(item.product.id)}
                      disabled={item.product.stock === 0 || !item.product.isActive}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <FiShoppingCart className="h-4 w-4 mr-2" />
                      {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    
                    {/* Notification Settings */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.notifyOnStock}
                            onChange={() => toggleNotification(item.product.id, 'stock', item.notifyOnStock)}
                            className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-1">Stock alerts</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.notifyOnSale}
                            onChange={() => toggleNotification(item.product.id, 'sale', item.notifyOnSale)}
                            className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-1">Sale alerts</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Tips */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Wishlist Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enable notifications to get alerts when items are back in stock or on sale</li>
              <li>• Share your wishlist with friends and family for gift ideas</li>
              <li>• Items in your wishlist are saved across all your devices</li>
              <li>• Check back regularly as prices and availability may change</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}