'use client';

interface ProductSortProps {
  onSortChange: (sortBy: string) => void;
}

export function ProductSort({ onSortChange }: ProductSortProps) {
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Sort by</label>
      <select
        onChange={(e) => onSortChange(e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
