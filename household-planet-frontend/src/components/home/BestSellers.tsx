'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Star, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { openWhatsAppForProduct } from '@/lib/whatsapp';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images?: string;
  averageRating?: number;
  totalReviews?: number;
}



export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts({ limit: 4, featured: true }) as any;
        if (data && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.log('No products available');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductImage = (product: Product) => {
    if (product.images) {
      try {
        const images = JSON.parse(product.images);
        return Array.isArray(images) ? images[0] : product.images;
      } catch {
        return product.images;
      }
    }
    return '/images/products/placeholder.svg';
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
          <Link href="/products" className="text-green-600 hover:text-green-800 font-medium">
            View All
          </Link>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Products Yet</h3>
            <p className="text-gray-600">Products added by admin will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 product-card transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src={getProductImage(product)} alt={product.name} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2">
                  <button className="bg-white rounded-full p-2 shadow hover:bg-green-100 text-gray-600 hover:text-green-600">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="text-xs text-white">In Stock</span>
                </div>
              </div>
              <div className="p-4">
                <Link href={`/products/${product.slug || product.id}`} className="text-sm font-medium text-gray-800 hover:text-green-600 line-clamp-2">
                  {product.name}
                </Link>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.averageRating || 0) ? 'fill-current' : i < (product.averageRating || 0) ? 'fill-current opacity-50' : ''}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">({product.totalReviews || 0})</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-green-600 font-bold">Ksh {product.price.toLocaleString()}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-gray-500 line-through ml-1">Ksh {product.comparePrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => openWhatsAppForProduct({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        slug: product.slug,
                        sku: `SKU-${product.id}`,
                        shortDescription: product.name
                      } as any)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                      title="Order via WhatsApp"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span className="text-xs">WhatsApp</span>
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white p-1.5 rounded-lg transition-colors">
                      <ShoppingCart className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
