'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Star, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  averageRating?: number;
  reviewCount?: number;
  stock?: number;
  category?: {
    name: string;
  };
}

interface SearchAutocompleteProps {
  onSelect?: (product: Product) => void;
}

export function SearchAutocomplete({ onSelect }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/api/products?search=${encodeURIComponent(query)}&limit=12`);
        setResults((response as any).data?.data || (response as any).data || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    onSelect?.(product as any);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getImageUrl = (images: string[]) => {
    if (!images || images.length === 0) {
      return '/images/placeholder.jpg';
    }
    
    const firstImage = images[0];
    
    // If it's already a full URL, return as is
    if (firstImage.startsWith('http')) {
      return firstImage;
    }
    
    // If it starts with /uploads, prepend the API base URL
    if (firstImage.startsWith('/uploads')) {
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${firstImage}`;
    }
    
    // Otherwise, assume it's a relative path and prepend /uploads
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${firstImage}`;
  };

  return (
    <div className="relative w-full max-w-4xl">
      <div className="relative">
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-orange-500 rounded-full p-1.5 flex items-center justify-center">
          <Search className="h-4 w-4 text-white" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-12 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[80vh] w-full sm:min-w-[500px] overflow-y-auto backdrop-blur-sm"
        >
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => handleSelect(product)}
                  className={`flex items-start p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200 group ${
                    index !== results.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mr-3 sm:mr-4 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={getImageUrl(product.images)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 64px, 80px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        
                        {product.category && (
                          <p className="text-xs sm:text-sm text-gray-500 mb-2">
                            {product.category.name}
                          </p>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-base sm:text-lg font-bold text-green-600">
                            {formatPrice(product.price)}
                          </span>
                          
                          <button className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors self-start">
                            Add to Cart
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </Link>
              ))}
              
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    window.location.href = `/products?search=${encodeURIComponent(query)}`;
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-base font-medium text-orange-600 hover:text-orange-700 transition-colors py-2 rounded-lg hover:bg-orange-50"
                >
                  View all results for "{query}" →
                </button>
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No products found for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Try different keywords or check spelling</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
