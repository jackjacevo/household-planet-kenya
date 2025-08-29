'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import CategoryDropdown from '@/components/admin/CategoryDropdown';
import { api } from '@/lib/api';

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState({
    category: undefined as number | undefined,
    brand: undefined as number | undefined,
    search: '',
    featured: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    search: true,
    special: true,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Fetch categories and filter options
    const fetchFilterOptions = async () => {
      try {
        const categoriesRes = await api.getCategoryHierarchy();
        const apiCategories = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data || []);
        setCategories(apiCategories);
        
        // Fetch brands
        const token = localStorage.getItem('token');
        const brandsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/brands`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands([{ id: '', name: 'All Brands' }, ...brandsData.filter((brand: any) => brand.isActive)]);
        }

      } catch (error) {
        console.error('Error fetching filter options:', error);
        // Set fallback categories if API fails
        setCategories([{ id: '', name: 'All Categories' }]);
        setBrands([{ id: '', name: 'All Brands' }]);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Only send supported parameters to the backend
    const backendFilters: any = {};
    if (newFilters.category) {
      backendFilters.category = newFilters.category;
    }
    if (newFilters.brand) {
      backendFilters.brand = newFilters.brand;
    }
    if (newFilters.search) {
      backendFilters.search = newFilters.search;
    }
    if (newFilters.featured) {
      backendFilters.featured = newFilters.featured;
    }
    onFilterChange(backendFilters);
    updateActiveFiltersCount(newFilters);
  };



  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateActiveFiltersCount = (currentFilters: any) => {
    let count = 0;
    if (currentFilters.category) count++;
    if (currentFilters.brand) count++;
    if (currentFilters.search) count++;
    if (currentFilters.featured) count++;
    setActiveFiltersCount(count);
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: undefined as number | undefined,
      brand: undefined as number | undefined,
      search: '',
      featured: false,
    };
    setFilters(defaultFilters);
    onFilterChange({});
    setActiveFiltersCount(0);
  };

  const FilterSection = ({ title, isExpanded, onToggle, children }: any) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 px-2 rounded-lg transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="pb-4 px-2">{children}</div>
      </motion.div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-2">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <p className="text-sm text-orange-600">{activeFiltersCount} active filters</p>
              )}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6 space-y-0">
        <FilterSection
          title="Category"
          isExpanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
        >
          <CategoryDropdown
            categories={categories}
            value={filters.category || ''}
            onChange={(categoryId) => handleFilterChange('category', categoryId)}
            placeholder="All Categories"
          />
        </FilterSection>

        <FilterSection
          title="Brand"
          isExpanded={expandedSections.brand}
          onToggle={() => toggleSection('brand')}
        >
          <select
            value={filters.brand || ''}
            onChange={(e) => handleFilterChange('brand', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {brands.map((brand) => (
              <option key={brand.id || 'all'} value={brand.id || ''}>
                {brand.name}
              </option>
            ))}
          </select>
        </FilterSection>

        <FilterSection
          title="Search"
          isExpanded={expandedSections.search}
          onToggle={() => toggleSection('search')}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </FilterSection>

        <FilterSection
          title="Special Filters"
          isExpanded={expandedSections.special}
          onToggle={() => toggleSection('special')}
        >
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.checked)}
              className="mr-3 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium">Featured Products Only</span>
          </label>
        </FilterSection>

        <div className="border-t border-gray-100 pt-6">
          <Button 
            onClick={resetFilters} 
            variant="outline" 
            className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Reset All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
