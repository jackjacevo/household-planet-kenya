'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort from '@/components/products/ProductSort';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { FiGrid, FiList, FiFilter, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  averageRating: number;
  totalReviews: number;
  category: { name: string };
  stock: number;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    availability: searchParams.get('availability') || '',
    brand: searchParams.get('brand') || ''
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/search?${queryParams}`);
      const data = await response.json();
      
      setProducts(data.products || []);
      setTotalPages(Math.ceil((data.total || 0) / 12));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchProducts();
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="max-w-7xl mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden bg-white shadow-sm sticky top-16 z-30">
            <div className="p-4">
              <h1 className="text-mobile-h1 text-gray-900 mb-2">Products</h1>
              <p className="text-gray-600 text-sm">Discover our wide range of household essentials</p>
            </div>
            
            {/* Mobile Controls */}
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(true)}
                  className="btn-mobile bg-white border border-gray-300 text-gray-700 flex items-center gap-2"
                >
                  <FiFilter size={16} />
                  Filters
                </button>
                
                <ProductSort sortBy={sortBy} onSortChange={handleSortChange} mobile />
              </div>
              
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`min-h-[44px] min-w-[44px] p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`min-h-[44px] min-w-[44px] p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
              <p className="text-gray-600">Discover our wide range of household essentials</p>
            </div>
          </div>

          <div className="flex gap-8 px-4 md:px-4">
            {/* Desktop Filters */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <ProductFilters 
                filters={filters} 
                onFiltersChange={handleFilterChange}
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Desktop Controls */}
              <div className="hidden md:flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {loading ? 'Loading...' : `${products.length} products found`}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <ProductSort sortBy={sortBy} onSortChange={handleSortChange} />
                  
                  <div className="flex border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                    >
                      <FiGrid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                    >
                      <FiList size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Results Count */}
              <div className="md:hidden px-4 py-2 text-sm text-gray-600">
                {loading ? 'Loading...' : `${products.length} products found`}
              </div>

              <ProductGrid 
                products={products} 
                loading={loading} 
                viewMode={viewMode}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 px-4">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-h-[44px] min-w-[44px] px-4 py-2 rounded flex-shrink-0 ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PullToRefresh>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="min-h-[44px] min-w-[44px] p-2 text-gray-500 hover:text-gray-700 rounded-lg active:bg-gray-100"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <ProductFilters 
                  filters={filters} 
                  onFiltersChange={handleFilterChange}
                  mobile
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}