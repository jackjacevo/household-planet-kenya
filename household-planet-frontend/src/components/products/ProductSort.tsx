'use client';

interface ProductSortProps {
  onSortChange: (sortBy: string, sortOrder?: string) => void;
}

export function ProductSort({ onSortChange }: ProductSortProps) {
  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
    { value: 'createdAt-asc', label: 'Oldest First', sortBy: 'createdAt', sortOrder: 'asc' },
    { value: 'name-asc', label: 'Name A-Z', sortBy: 'name', sortOrder: 'asc' },
    { value: 'name-desc', label: 'Name Z-A', sortBy: 'name', sortOrder: 'desc' },
    { value: 'price-asc', label: 'Price Low to High', sortBy: 'price', sortOrder: 'asc' },
    { value: 'price-desc', label: 'Price High to Low', sortBy: 'price', sortOrder: 'desc' },
    { value: 'rating-desc', label: 'Highest Rated', sortBy: 'rating', sortOrder: 'desc' },
  ];

  const handleSortChange = (value: string) => {
    const option = sortOptions.find(opt => opt.value === value);
    if (option) {
      onSortChange(option.sortBy, option.sortOrder);
    }
  };

  return (
    <select
      onChange={(e) => handleSortChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      defaultValue="createdAt-desc"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
