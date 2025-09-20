'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductSort } from '@/components/products/ProductSort';
import { Pagination } from '@/components/ui/Pagination';
import SEOHead from '@/components/SEO/SEOHead';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { Loader2, Grid3X3, List, Filter, Package, Tag, X } from 'lucide-react';

const categoryDescriptions = {
  'kitchen-dining': {
    title: 'Kitchen & Dining Essentials',
    description: 'Transform your culinary space with our premium collection of kitchen and dining essentials. From professional-grade cookware to elegant dinnerware, find everything you need to create memorable meals and dining experiences.',
    features: [
      'Professional-grade cookware and utensils',
      'Elegant dinnerware and serving pieces',
      'Space-saving storage solutions',
      'Easy-to-clean and maintain products'
    ],
    seoKeywords: [
      'kitchen appliances Kenya',
      'cookware Nairobi',
      'dining sets Kenya',
      'kitchen utensils',
      'professional cookware'
    ]
  },
  'home-decor': {
    title: 'Home Decor & Accessories',
    description: 'Elevate your living space with our curated collection of home decor and accessories. From modern art pieces to cozy textiles, create a home that reflects your unique style and personality.',
    features: [
      'Stylish wall art and decorative pieces',
      'Comfortable and beautiful textiles',
      'Unique accent pieces and sculptures',
      'Seasonal and themed decorations'
    ],
    seoKeywords: [
      'home decor Kenya',
      'wall art Nairobi',
      'decorative accessories',
      'modern home decor',
      'interior design Kenya'
    ]
  },
  'storage': {
    title: 'Storage & Organization',
    description: 'Maximize your space and minimize clutter with our innovative storage and organization solutions. From closet organizers to kitchen storage, find the perfect solution for every room in your home.',
    features: [
      'Space-maximizing storage containers',
      'Closet and wardrobe organizers',
      'Kitchen and pantry storage',
      'Bathroom and laundry organization'
    ],
    seoKeywords: [
      'storage solutions Kenya',
      'home organization',
      'closet organizers',
      'storage containers',
      'space saving solutions'
    ]
  }
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({
    category: slug,
    minPrice: 0,
    maxPrice: 100000,
    rating: 0,
    sortBy: 'newest',
  });

  const categoryInfo = categoryDescriptions[slug as keyof typeof categoryDescriptions];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [slug, currentPage, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { category, ...otherFilters } = filters;
      const response = await api.getProducts({
        page: currentPage,
        limit: 12,
        category: slug,
        ...otherFilters,
      }) as any;
      
      const newProducts = response.products || (response as any).data || response || [];
      setProducts(Array.isArray(newProducts) ? newProducts : []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...newFilters, category: slug });
    setCurrentPage(1);
  };

  if (!categoryInfo) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <p>The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryInfo.title,
    description: categoryInfo.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/categories/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: (Array.isArray(products) ? products : []).slice(0, 10).map((product, index) => ({
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
  };

  return (
    <>
      <SEOHead
        title={`${categoryInfo.title} - Quality Products in Kenya`}
        description={categoryInfo.description}
        keywords={categoryInfo.seoKeywords}
        url={`/categories/${slug}`}
        type="website"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        {/* Breadcrumbs */}
        <div className="px-4 pt-4">
          <div className="container mx-auto max-w-7xl">
            <Breadcrumbs
              items={[
                { name: 'Categories', url: '/categories' },
                { name: categoryInfo.title, url: `/categories/${slug}` }
              ]}
            />
          </div>
        </div>
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-8 md:py-16 px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10" />
          <div className="container mx-auto max-w-7xl relative z-10">
            <motion.div 
              className="text-center mb-8"
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
                {categoryInfo.title}
              </motion.h1>
              <motion.p 
                className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {categoryInfo.description}
              </motion.p>
            </motion.div>

            {/* Category Features */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {categoryInfo.features.map((feature, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg p-2">
                      <Tag className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">{feature}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

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
                <ProductFilters onFilterChange={handleFilterChange} />
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
                      
                      {/* Clear Category Filter Button */}
                      <button
                        onClick={() => window.location.href = '/products'}
                        className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm border border-orange-200"
                      >
                        <span>Clear Category</span>
                        <X className="h-4 w-4" />
                      </button>
                      
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
                      
                      <ProductSort onSortChange={(sortBy) => handleFilterChange({ ...filters, sortBy })} />
                    </div>
                  </div>
                </motion.div>

                {/* Products Grid/List */}
                {loading ? (
                  <motion.div 
                    className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-full p-4 mb-4">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading products...</p>
                  </motion.div>
                ) : (
                  <>
                    {products.length === 0 ? (
                      <motion.div 
                        className="text-center py-16 bg-white rounded-3xl shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                          <Package className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your filters or check back later</p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className={`grid gap-4 md:gap-6 ${
                          viewMode === 'grid' || isMobile
                            ? 'mobile-grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'grid-cols-1'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        {products.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                          >
                            <ProductCard product={product} viewMode={isMobile ? 'grid' : viewMode} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
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
                )}
              </main>
            </div>
          </div>
        </section>

        {/* Mobile Filters Overlay */}
        {showFilters && isMobile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ProductFilters onFilterChange={handleFilterChange} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}