'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp, Filter, X, Package, Search } from 'lucide-react';
import CategoryDropdown from '@/components/admin/CategoryDropdown';
import { api } from '@/lib/api';

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

export function ProductFilters({ onFilterChange, initialFilters }: ProductFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    category: undefined as number | undefined,
    brand: undefined as number | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    minRating: undefined as number | undefined,
    inStock: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    search: false,
    category: false,
    brand: false,
    availability: false,
  });

  useEffect(() => {
    setExpandedSections({
      search: true,
      category: true,
      brand: true,
      availability: true,
    });
  }, []);

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);


  useEffect(() => {
    if (initialFilters) {
      const hasAnyFilter = Object.values(initialFilters).some(value => 
        value !== undefined && value !== '' && value !== false && value !== 0
      );
      
      if (!hasAnyFilter) {
        const defaultFilters = {
          search: '',
          category: undefined,
          brand: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          minRating: undefined,
          inStock: false,
        };
        setFilters(defaultFilters);
        setActiveFiltersCount(0);
      }
    }
  }, [initialFilters]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const categoriesRes = await api.getCategoryHierarchy();
        const apiCategories = Array.isArray(categoriesRes) ? categoriesRes : ((categoriesRes as any)?.data || []);
        setCategories(apiCategories);
        
        try {
          const brandsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/brands`);
          if (brandsRes.ok) {
            const brandsData = await brandsRes.json();
            setBrands(brandsData);
          } else {
            setBrands([]);
          }
        } catch (brandError) {
          setBrands([]);
        }
      } catch (error) {
        setCategories([]);
        setBrands([]);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    updateActiveFiltersCount(filters);
  }, [filters]);

  const updateActiveFiltersCount = (currentFilters: any) => {
    let count = 0;
    if (currentFilters.search && currentFilters.search.trim() !== '') count++;
    if (currentFilters.category && currentFilters.category !== 0) count++;
    if (currentFilters.brand && currentFilters.brand !== 0) count++;
    if (currentFilters.minPrice !== undefined) count++;
    if (currentFilters.maxPrice !== undefined) count++;
    if (currentFilters.minRating !== undefined) count++;
    if (currentFilters.inStock === true) count++;
    setActiveFiltersCount(count);
  };



  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const backendFilters: any = {};
    
    if (newFilters.search && newFilters.search.trim() !== '') {
      backendFilters.search = newFilters.search.trim();
    }
    if (newFilters.category && newFilters.category !== 0) {
      backendFilters.category = newFilters.category;
    }
    if (newFilters.brand && newFilters.brand !== 0) {
      backendFilters.brand = newFilters.brand;
    }
    if (newFilters.minPrice !== undefined) {
      backendFilters.minPrice = newFilters.minPrice;
    }
    if (newFilters.maxPrice !== undefined) {
      backendFilters.maxPrice = newFilters.maxPrice;
    }
    if (newFilters.minRating !== undefined) {
      backendFilters.minRating = newFilters.minRating;
    }
    if (newFilters.inStock === true) {
      backendFilters.inStock = true;
    }
    
    onFilterChange(backendFilters);
    updateActiveFiltersCount(newFilters);
  };



  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      category: undefined as number | undefined,
      brand: undefined as number | undefined,
      minPrice: undefined as number | undefined,
      maxPrice: undefined as number | undefined,
      minRating: undefined as number | undefined,
      inStock: false,
    };
    setFilters(defaultFilters);
    onFilterChange({});
    setActiveFiltersCount(0);
  };

  const FilterSection = ({ title, isExpanded, onToggle, children }: any) => (
    <div className="border-b border-gray-100 last:border-b-0 relative">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 sm:py-4 text-left hover:bg-gray-50 px-2 rounded-lg transition-colors min-h-[44px]"
      >
        <span className="font-medium text-gray-900 text-sm sm:text-base">{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-visible"
      >
        <div className="pb-3 sm:pb-4 px-2 overflow-visible">{children}</div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-0">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <p className="text-xs sm:text-sm text-orange-600">{activeFiltersCount} active</p>
              )}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs border border-red-200 min-h-[44px]"
            >
              <X className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input - Always Visible */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
          />
        </div>
      </div>

      <FilterSection
        title={`Category ${filters.category ? '(1)' : ''}`}
        isExpanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div className="relative" style={{ zIndex: 1000 }}>
          {categories.length > 0 ? (
            <div className="space-y-2">
              <CategoryDropdown
                categories={categories}
                value={filters.category || ''}
                onChange={(categoryId) => handleFilterChange('category', categoryId)}
                placeholder="All Categories"
              />
              {filters.category && (
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-xs border border-orange-200"
                >
                  <X className="h-3 w-3" />
                  <span>Clear category</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-xl">
              Loading categories...
            </div>
          )}
        </div>
      </FilterSection>

      <FilterSection
        title="Brand"
        isExpanded={expandedSections.brand}
        onToggle={() => toggleSection('brand')}
      >
        <div className="relative" style={{ zIndex: 999 }}>
          <select
            value={filters.brand || ''}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('brand', value ? Number(value) : undefined);
            }}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </FilterSection>

      <div className="border-b border-gray-100 pb-3 sm:pb-4 mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 text-sm sm:text-base">
            Price Range {(filters.minPrice || filters.maxPrice) ? '(1)' : ''}
          </h4>
          {(filters.minPrice || filters.maxPrice) && (
            <button
              onClick={() => {
                handleFilterChange('minPrice', undefined);
                handleFilterChange('maxPrice', undefined);
              }}
              className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs border border-green-200"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
          />
        </div>
      </div>

      <div className="border-b border-gray-100 pb-3 sm:pb-4 mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 text-sm sm:text-base">
            Minimum Rating {filters.minRating ? '(1)' : ''}
          </h4>
          {filters.minRating && (
            <button
              onClick={() => handleFilterChange('minRating', undefined)}
              className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-xs border border-yellow-200"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
        <select
          value={filters.minRating || ''}
          onChange={(e) => handleFilterChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>
      </div>

      <FilterSection
        title="Availability"
        isExpanded={expandedSections.availability}
        onToggle={() => toggleSection('availability')}
      >
        <label className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors min-h-[44px]">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="mr-3 text-orange-600 focus:ring-orange-500 w-4 h-4"
          />
          <Package className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
          <span className="text-sm sm:text-base font-medium">In Stock Only</span>
        </label>
      </FilterSection>


    </div>
  );
}
