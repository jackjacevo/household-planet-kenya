'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

interface SearchFilters {
  categoryIds?: number[];
  brandIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

export default function EnhancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Load initial query from URL
    const urlQuery = searchParams.get('search');
    if (urlQuery) {
      setQuery(urlQuery);
    }

    // Load categories and brands for filters
    loadFiltersData();
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/api/products?search=${encodeURIComponent(query)}&limit=15`);
        setResults(response.data?.data || response.data || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const loadFiltersData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands')
      ]);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('search', query.trim());
      
      // Add filters to URL
      if (filters.categoryIds?.length) {
        params.set('categories', filters.categoryIds.join(','));
      }
      if (filters.brandIds?.length) {
        params.set('brands', filters.brandIds.join(','));
      }
      if (filters.minPrice) {
        params.set('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice) {
        params.set('maxPrice', filters.maxPrice.toString());
      }
      if (filters.rating) {
        params.set('rating', filters.rating.toString());
      }
      if (filters.inStock) {
        params.set('inStock', 'true');
      }
      if (filters.sortBy) {
        params.set('sortBy', filters.sortBy);
        params.set('sortOrder', filters.sortOrder || 'desc');
      }

      router.push(`/products?${params.toString()}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  );

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
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="absolute left-2 top-2.5 bg-orange-500 rounded-full p-1.5 flex items-center justify-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border-t border-b border-r border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors ${
              hasActiveFilters ? 'text-green-600 bg-green-50' : 'text-gray-600'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <div className="flex space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <select
                multiple
                value={filters.categoryIds?.map(String) || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                  setFilters(prev => ({ ...prev, categoryIds: values }));
                }}
                className="w-full border border-gray-300 rounded-md p-2 text-sm max-h-32"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value || undefined }))}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="">Relevance</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="createdAt">Newest</option>
                <option value="totalSales">Best Selling</option>
                <option value="averageRating">Rating</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock || false}
                onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked || undefined }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">In stock only</span>
            </label>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Min Rating:</label>
              <select
                value={filters.rating || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="border border-gray-300 rounded-md p-1 text-sm"
              >
                <option value="">Any</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && !showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-40 max-h-[700px] overflow-y-auto backdrop-blur-sm">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product.slug)}
                  className={`w-full p-5 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-green-50 flex items-center space-x-5 transition-all duration-200 group ${
                    index !== results.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(product.images)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </div>
                    <div className="text-xl font-bold text-green-600 mt-2">
                      KSh {product.price.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => handleSearch()}
                  className="w-full text-center text-base font-medium text-orange-600 hover:text-orange-700 transition-colors py-2"
                >
                  View all results for "{query}" →
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <div className="text-gray-500">
                <div className="h-8 w-8 mx-auto mb-2 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm">No products found for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Try different keywords or check spelling</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}