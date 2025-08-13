'use client';

import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

interface FilterProps {
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    rating: string;
    availability: string;
    brand: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function ProductFilters({ filters, onFiltersChange }: FilterProps) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    availability: true,
    brand: true
  });

  useEffect(() => {
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/brands`)
      ]);
      
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);
      
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      availability: '',
      brand: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FiX size={14} />
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
        >
          Category
          {expandedSections.category ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.category && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value=""
                checked={filters.category === ''}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="mr-2"
              />
              All Categories
            </label>
            {categories.map((category: any) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={filters.category === category.id}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="mr-2"
                />
                {category.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
        >
          Price Range
          {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              {[
                { label: 'Under KSh 1,000', min: '', max: '1000' },
                { label: 'KSh 1,000 - 5,000', min: '1000', max: '5000' },
                { label: 'KSh 5,000 - 10,000', min: '5000', max: '10000' },
                { label: 'Over KSh 10,000', min: '10000', max: '' }
              ].map((range) => (
                <label key={range.label} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                    onChange={() => {
                      updateFilter('minPrice', range.min);
                      updateFilter('maxPrice', range.max);
                    }}
                    className="mr-2"
                  />
                  {range.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
        >
          Customer Rating
          {expandedSections.rating ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  value={rating.toString()}
                  checked={filters.rating === rating.toString()}
                  onChange={(e) => updateFilter('rating', e.target.value)}
                  className="mr-2"
                />
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-1 text-sm text-gray-600">& Up</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('availability')}
          className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
        >
          Availability
          {expandedSections.availability ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.availability && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.availability === 'in-stock'}
                onChange={(e) => updateFilter('availability', e.target.checked ? 'in-stock' : '')}
                className="mr-2"
              />
              In Stock Only
            </label>
          </div>
        )}
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('brand')}
            className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
          >
            Brand
            {expandedSections.brand ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {expandedSections.brand && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand: any) => (
                <label key={brand} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.brand === brand}
                    onChange={(e) => updateFilter('brand', e.target.checked ? brand : '')}
                    className="mr-2"
                  />
                  {brand}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}