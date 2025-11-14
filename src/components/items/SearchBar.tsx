// SearchBar - Sprint 3 version

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  itemCount: number;
  totalCount: number;
}

export default function SearchBar({ value, onChange, itemCount, totalCount }: SearchBarProps) {
  const hasSearch = value.length > 0;
  const isFiltered = itemCount < totalCount;

  return (
    <div className="space-y-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search items..."
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A] focus:border-transparent"
        />
        {hasSearch && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {isFiltered && (
        <div className="text-xs text-gray-600 text-right">
          Showing <span className="font-semibold text-[#3FB95A]">{itemCount}</span> of {totalCount}
        </div>
      )}
    </div>
  );
}
