'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  parentId?: number;
  children?: Category[];
}

interface CategoryDropdownProps {
  categories: Category[];
  value: number | string;
  onChange: (categoryId: number) => void;
  placeholder?: string;
  className?: string;
}

export default function CategoryDropdown({
  categories,
  value,
  onChange,
  placeholder = "Select Category",
  className = ""
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const parentCategories = categories.filter(cat => !cat.parentId);
  const selectedCategory = parentCategories.find(cat => cat.id === Number(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (categoryId: number) => {
    if (categoryId === 0) {
      onChange(undefined as any);
    } else {
      onChange(categoryId);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-left flex items-center justify-between"
      >
        <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-xl" style={{ zIndex: 1001 }}>
          <div className="py-1 max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleCategorySelect(0)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700 border-b border-gray-100"
            >
              All Categories
            </button>
            {parentCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className="w-full px-3 py-2 text-left hover:bg-orange-50 text-gray-700"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}