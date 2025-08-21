'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Star, Package, ChevronDown, ChevronUp, Filter, X, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: 0,
    maxPrice: 100000,
    rating: 0,
    inStock: false,
    size: '',
    color: '',
    material: '',
    brand: '',
    availability: 'all',
    discount: false,
    tags: [] as string[],
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    attributes: true,
    availability: false,
    brand: false,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [availableFilters, setAvailableFilters] = useState({
    sizes: [] as string[],
    colors: [] as string[],
    materials: [] as string[],
    brands: [] as string[],
    tags: [] as string[]
  });
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Fetch categories and filter options
    const fetchFilterOptions = async () => {
      try {
        const categoriesRes = await api.getCategories();
        const apiCategories = Array.isArray(categoriesRes) ? categoriesRes : [];
        setCategories([{ id: '', name: 'All Categories' }, ...apiCategories]);
        
        // Mock filter options - in real app, fetch from API
        setAvailableFilters({
          sizes: ['Small', 'Medium', 'Large', 'XL'],
          colors: ['Red', 'Blue', 'Green', 'Black', 'White', 'Brown', 'Silver', 'Gold'],
          materials: ['Plastic', 'Metal', 'Wood', 'Glass', 'Ceramic', 'Stainless Steel', 'Bamboo'],
          brands: ['KitchenPro', 'HomeEssentials', 'QualityWare', 'ModernLiving', 'EcoFriendly'],
          tags: ['Eco-Friendly', 'Dishwasher Safe', 'Non-Stick', 'Heat Resistant', 'Microwave Safe']
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
        // Set fallback categories if API fails
        setCategories([{ id: '', name: 'All Categories' }]);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFiltersCount(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange('tags', newTags);
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
    if (currentFilters.minPrice > 0 || currentFilters.maxPrice < 100000) count++;
    if (currentFilters.rating > 0) count++;
    if (currentFilters.inStock) count++;
    if (currentFilters.size) count++;
    if (currentFilters.color) count++;
    if (currentFilters.material) count++;
    if (currentFilters.brand) count++;
    if (currentFilters.discount) count++;
    if (currentFilters.tags.length > 0) count++;
    setActiveFiltersCount(count);
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: '',
      minPrice: 0,
      maxPrice: 100000,
      rating: 0,
      inStock: false,
      size: '',
      color: '',
      material: '',
      brand: '',
      availability: 'all',
      discount: false,
      tags: [] as string[],
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setPriceRange([0, 100000]);
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
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FilterSection>

        <FilterSection
          title="Price Range"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={filters.maxPrice === 100000 ? '' : filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value) || 100000)}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[500, 1000, 2000, 5000, 10000].map((price) => (
                <button
                  key={price}
                  onClick={() => {
                    handleFilterChange('minPrice', 0);
                    handleFilterChange('maxPrice', price);
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-orange-100 hover:text-orange-700 rounded-full transition-colors"
                >
                  Under KSh {price.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title="Customer Rating"
          isExpanded={expandedSections.rating}
          onToggle={() => toggleSection('rating')}
        >
          <div className="space-y-3">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.rating === rating}
                  onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                  className="mr-3 text-orange-600 focus:ring-orange-500"
                />
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">& up</span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Availability"
          isExpanded={expandedSections.availability}
          onToggle={() => toggleSection('availability')}
        >
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="mr-3 text-green-600 focus:ring-green-500"
              />
              <Package className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-sm font-medium">In Stock Only</span>
            </label>
            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={filters.discount}
                onChange={(e) => handleFilterChange('discount', e.target.checked)}
                className="mr-3 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-red-600">On Sale</span>
            </label>
          </div>
        </FilterSection>

        <FilterSection
          title="Product Attributes"
          isExpanded={expandedSections.attributes}
          onToggle={() => toggleSection('attributes')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {availableFilters.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFilterChange('size', filters.size === size ? '' : size)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.size === size
                        ? 'bg-orange-100 border-orange-300 text-orange-700'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {availableFilters.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleFilterChange('color', filters.color === color ? '' : color)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.color === color
                        ? 'bg-orange-100 border-orange-300 text-orange-700'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Material</label>
              <select
                value={filters.material}
                onChange={(e) => handleFilterChange('material', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Any Material</option>
                {availableFilters.materials.map((material) => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title="Brand"
          isExpanded={expandedSections.brand}
          onToggle={() => toggleSection('brand')}
        >
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Brands</option>
            {availableFilters.brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </FilterSection>

        {/* Tags/Features */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Features</h4>
          <div className="flex flex-wrap gap-2">
            {availableFilters.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors flex items-center space-x-1 ${
                  filters.tags.includes(tag)
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                {filters.tags.includes(tag) && <Check className="h-3 w-3" />}
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>

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
