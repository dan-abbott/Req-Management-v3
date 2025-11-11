interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  itemCount: number;
}

export default function SearchBar({ searchQuery, onSearchChange, itemCount }: SearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search items..."
        className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500"
      />
      
      {/* Search Icon */}
      <svg
        className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Clear Button */}
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Item Count */}
      <div className="mt-1 text-xs text-gray-500 text-right">
        {itemCount} item{itemCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
