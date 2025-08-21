'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';

const products = [
  {
    id: '13',
    name: 'Memory Foam Pillow Set - 2 Pieces',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    price: 3799,
    rating: 4.9,
    reviews: 67
  },
  {
    id: '14',
    name: 'Stainless Steel Water Bottle - 1L',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    price: 1299,
    rating: 4.7,
    reviews: 89
  },
  {
    id: '15',
    name: 'Wooden Spice Rack - 12 Jars',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    price: 2899,
    rating: 4.8,
    reviews: 45
  },
  {
    id: '16',
    name: 'Cotton Bath Mat Set - 3 Pieces',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    price: 2199,
    rating: 4.6,
    reviews: 38
  }
];

export function TopRated() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Top Rated</h2>
          <Link href="/products" className="text-green-600 hover:text-green-800 font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 product-card transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2">
                  <button className="bg-white rounded-full p-2 shadow hover:bg-green-100 text-gray-600 hover:text-green-600">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="text-xs text-white">Top Rated</span>
                </div>
              </div>
              <div className="p-4">
                <Link href={`/products/${product.id}`} className="text-sm font-medium text-gray-800 hover:text-green-600 line-clamp-2">
                  {product.name}
                </Link>
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-current' : i < product.rating ? 'fill-current opacity-50' : ''}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-green-600 font-bold">Ksh {product.price.toLocaleString()}</span>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition">
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}