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
        const response = await api.get(`/products/search/autocomplete?q=${encodeURIComponent(query)}&limit=8`);
        setResults(response.data);
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product.slug)}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                >
                  <img
                    src={product.images[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
                    <div className="text-sm text-green-600 font-semibold">
                      KSh {product.price.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => handleSearch()}
                className="w-full p-3 text-center text-green-600 hover:bg-gray-50 border-t border-gray-200 font-medium"
              >
                View all results for "{query}"
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}