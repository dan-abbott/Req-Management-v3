import React from 'react';
import { Item } from '../../types';
import { TYPE_COLORS, STATUS_COLORS } from '../../utils/constants';

interface ItemListProps {
  items: Item[];
  selectedItem: Item | null;
  onSelectItem: (item: Item) => void;
  loading: boolean;
}

export function ItemList({ items, selectedItem, onSelectItem, loading }: ItemListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3FB95A]"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium mb-1">No items yet</p>
        <p className="text-sm">Click "New Item" to create your first item</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelectItem(item)}
          className={`
            w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors
            ${selectedItem?.id === item.id ? 'bg-[#3FB95A]/10 border-l-4 border-[#3FB95A]' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Type badge */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TYPE_COLORS[item.type]}`}>
                  {item.type.toUpperCase()}
                </span>
                {item.level && (
                  <span className="text-xs text-gray-500">
                    {item.level}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  ID: {item.id}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-medium text-gray-900 truncate mb-1">
                {item.title}
              </h3>

              {/* Description preview */}
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className={`px-2 py-0.5 rounded ${STATUS_COLORS[item.status]}`}>
                  {item.status}
                </span>
                {item.priority && (
                  <span>Priority: {item.priority}</span>
                )}
                {item.owner && (
                  <span>Owner: {item.owner}</span>
                )}
                <span>v{item.version}</span>
              </div>
            </div>

            {/* Chevron */}
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}
