'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductSort } from '@/components/products/ProductSort';
import { Pagination } from '@/components/ui/Pagination';
import { InfiniteScroll } from '@/components/products/InfiniteScroll';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { Loader2, Grid3X3, List, Search, Filter, Package, ShoppingBag, X } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [scrollMode, setScrollMode] = useState<'pagination' | 'infinite'>('pagination');
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({
    category: undefined as string | undefined,
    brand: undefined as string | undefined,
    search: undefined as string | undefined,
    featured: undefined as boolean | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    minRating: undefined as number | undefined,
    inStock: undefined as boolean | undefined,
    onSale: undefined as boolean | undefined,
    sortBy: 'createdAt',
    sortOrder: undefined as string | undefined,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentPage === 1) {
      fetchProducts();
    } else {
      fetchProducts(scrollMode === 'infinite');
    }
  }, [currentPage, filters, scrollMode]);

  const fetchProducts = async (append = false, refresh = false) => {
    try {
      setError(null);
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const queryParams: any = {
        page: currentPage,
        limit: 12,
        sortBy: filters.sortBy || 'createdAt',
      };
      
      if (filters.category) {
        queryParams.category = filters.category;
      }
      if (filters.brand) {
        queryParams.brand = filters.brand;
      }
      if (filters.search) {
        queryParams.search = filters.search;
      }
      if (filters.featured) {
        queryParams.featured = filters.featured;
      }
      if (filters.minPrice !== undefined) {
        queryParams.minPrice = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        queryParams.maxPrice = filters.maxPrice;
      }
      if (filters.minRating !== undefined) {
        queryParams.minRating = filters.minRating;
      }
      if (filters.inStock) {
        queryParams.inStock = filters.inStock;
      }
      if (filters.onSale) {
        queryParams.onSale = filters.onSale;
      }
      if (filters.sortOrder) {
        queryParams.sortOrder = filters.sortOrder;
      }
      
      const response = await api.getProducts(queryParams) as any;
      
      const newProducts = response.data || [];
      if (append && scrollMode === 'infinite') {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      
      setTotalPages(response.pagination?.totalPages || 1);
      setHasMore(currentPage < (response.pagination?.totalPages || 1));
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      if (!append) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setCurrentPage(1);
    await fetchProducts(false, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    // If newFilters is empty object, reset all filters
    if (Object.keys(newFilters).length === 0) {
      setFilters({
        category: undefined,
        brand: undefined,
        search: undefined,
        featured: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        minRating: undefined,
        inStock: undefined,
        onSale: undefined,
        sortBy: 'createdAt',
        sortOrder: undefined,
      });
    } else {
      setFilters(prev => ({ ...prev, ...newFilters }));
    }
    setCurrentPage(1);
  };

  const structuredData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Products - Household Planet Kenya',
    description: 'Browse our complete collection of quality household products, kitchen appliances, and home decor items.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: product.name,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
        image: product.images?.[0],
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'KES'
        }
      }))
    }
  }), [products])

  return (
    <>
      <SEOHead
        title="All Products - Quality Household Items & Appliances"
        description="Browse our complete collection of quality household products, kitchen appliances, home decor, and more. Find everything you need for your home with fast delivery across Kenya."
        keywords={[
          'household products Kenya',
          'kitchen appliances',
          'home decor Kenya',
          'quality home products',
          'online shopping Kenya',
          'household items Nairobi'
        ]}
        url="/products"
        type="website"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <PullToRefresh onRefresh={handleRefresh} disabled={loading}>
        {/* Breadcrumbs */}
        <div className="px-4 pt-4">
          <div className="container mx-auto max-w-7xl">
            <Breadcrumbs
              items={[
                { name: 'Products', url: '/products' }
              ]}
            />
          </div>
        </div>
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-8 md:py-16 px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10" />
          <div className="container mx-auto max-w-7xl relative z-10">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                All Products
              </motion.h1>
              <motion.p 
                className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Discover our complete collection of quality home products
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Mobile Filters Overlay */}
        {showFilters && isMobile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-orange-50 to-amber-50 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ProductFilters onFilterChange={handleFilterChange} initialFilters={filters} />
              <div className="mt-6">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <section className="px-4 pb-16">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Desktop Sidebar Filters */}
              <motion.aside 
                className="hidden lg:block lg:w-80"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl p-6 shadow-lg border border-orange-100 sticky top-4">
                  <ProductFilters onFilterChange={handleFilterChange} initialFilters={filters} />
                </div>
              </motion.aside>

            {/* Main Products Area */}
            <main className="flex-1">
              {/* Controls Bar */}
              <motion.div 
                className="bg-white rounded-2xl p-4 mb-8 shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                      <Package className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-600 font-medium">
                        {loading ? 'Loading...' : `${products.length} products`}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filters</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          viewMode === 'grid'
                            ? 'bg-white shadow-md text-orange-600'
                            : 'text-gray-600 hover:text-orange-600'
                        }`}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          viewMode === 'list'
                            ? 'bg-white shadow-md text-orange-600'
                            : 'text-gray-600 hover:text-orange-600'
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-4 whitespace-nowrap">
                      <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => setScrollMode('pagination')}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            scrollMode === 'pagination'
                              ? 'bg-white shadow-md text-orange-600'
                              : 'text-gray-600 hover:text-orange-600'
                          }`}
                        >
                          Pages
                        </button>
                        <button
                          onClick={() => setScrollMode('infinite')}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            scrollMode === 'infinite'
                              ? 'bg-white shadow-md text-orange-600'
                              : 'text-gray-600 hover:text-orange-600'
                          }`}
                        >
                          Scroll
                        </button>
                      </div>
                      
                      <ProductSort onSortChange={(sortBy, sortOrder) => handleFilterChange({ sortBy, sortOrder })} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Error State */}
              {error && (
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-center">
                    <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-red-600 text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={() => fetchProducts()}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Products Grid/List */}
              {!error && loading ? (
                <motion.div 
                  className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-full p-4 mb-4">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading amazing products...</p>
                </motion.div>
              ) : !error ? (
                <>
                  {products.length === 0 ? (
                    <motion.div 
                      className="text-center py-16 bg-white rounded-3xl shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Search className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                      <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                      <button
                        onClick={() => handleFilterChange({})}
                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                      >
                        Clear Filters
                      </button>
                    </motion.div>
                  ) : (
                    scrollMode === 'infinite' ? (
                      <InfiniteScroll
                        hasMore={hasMore}
                        loading={loading}
                        onLoadMore={loadMore}
                      >
                        <motion.div 
                          className={`grid gap-4 md:gap-6 ${
                            viewMode === 'grid' || isMobile
                              ? 'mobile-grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                              : 'grid-cols-1'
                          }`}
                          variants={staggerContainer}
                          initial="initial"
                          animate="animate"
                        >
                          {products.map((product, index) => (
                            <motion.div
                              key={`${product.id}-${index}`}
                              variants={fadeInUp}
                              custom={index}
                            >
                              <ProductCard product={product} viewMode={isMobile ? 'grid' : viewMode} />
                            </motion.div>
                          ))}
                        </motion.div>
                      </InfiniteScroll>
                    ) : (
                      <motion.div 
                        className={`grid gap-4 md:gap-6 ${
                          viewMode === 'grid' || isMobile
                            ? 'mobile-grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'grid-cols-1'
                        }`}
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {products.map((product, index) => (
                          <motion.div
                            key={product.id}
                            variants={fadeInUp}
                            custom={index}
                          >
                            <ProductCard product={product} viewMode={isMobile ? 'grid' : viewMode} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )
                  )}

                  {/* Pagination */}
                  {scrollMode === 'pagination' && totalPages > 1 && (
                    <motion.div 
                      className="mt-12 flex justify-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    </motion.div>
                  )}
                </>
              ) : null}
            </main>
            </div>
          </div>
        </section>
      </PullToRefresh>
      </div>
    </>
  );
}
