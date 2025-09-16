'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  parentId?: number;
  children: Category[];
}

interface AdminCategoryDropdownProps {
  categories: Category[];
  value: number | string;
  onChange: (categoryId: number) => void;
  placeholder?: string;
  className?: string;
}

export default function AdminCategoryDropdown({
  categories,
  value,
  onChange,
  placeholder = "Select Category",
  className = ""
}: AdminCategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredParent, setHoveredParent] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Flatten all categories for easier searching
  const allCategories = categories.reduce((acc: Category[], cat) => {
    acc.push(cat);
    if (cat.children) {
      acc.push(...cat.children);
    }
    return acc;
  }, []);
  
  const parentCategories = categories.filter(cat => !cat.parentId);
  const selectedCategory = allCategories.find(cat => cat.id === Number(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredParent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (categoryId: number) => {
    onChange(categoryId);
    setIsOpen(false);
    setHoveredParent(null);
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
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-xl z-50">
          <div className="py-1 max-h-60 overflow-visible">
            {parentCategories.map((parent) => (
              <div
                key={parent.id}
                className="relative"
                onMouseEnter={() => setHoveredParent(parent.id)}
              >
                <button
                  type="button"
                  onClick={() => handleCategorySelect(parent.id)}
                  className="w-full px-3 py-2 text-left bg-orange-50 hover:bg-orange-100 flex items-center justify-between group"
                >
                  <span className="text-orange-900 font-medium">{parent.name}</span>
                  {parent.children && parent.children.length > 0 && (
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  )}
                </button>

                {/* Subcategories dropdown */}
                {hoveredParent === parent.id && parent.children && parent.children.length > 0 && (
                  <div 
                    className="absolute left-full top-0 ml-1 w-full bg-white border border-gray-300 rounded-xl shadow-xl z-50"
                    onMouseEnter={() => setHoveredParent(parent.id)}
                    onMouseLeave={() => setHoveredParent(null)}
                  >
                    <div className="py-1">
                      {parent.children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleCategorySelect(child.id)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-700 whitespace-nowrap"
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}