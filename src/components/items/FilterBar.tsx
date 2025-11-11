// Filter Bar Component

import { Filter, X } from 'lucide-react';
import { ItemType, ItemStatus, ItemPriority } from '../../types';

interface FilterBarProps {
  selectedTypes: ItemType[];
  selectedStatuses: ItemStatus[];
  selectedPriorities: ItemPriority[];
  onTypeChange: (types: ItemType[]) => void;
  onStatusChange: (statuses: ItemStatus[]) => void;
  onPriorityChange: (priorities: ItemPriority[]) => void;
  onClearAll: () => void;
}

const ITEM_TYPES: ItemType[] = ['Epic', 'Requirement', 'Test Case', 'Defect'];

const ITEM_STATUSES: Record<ItemType, ItemStatus[]> = {
  'Epic': ['Draft', 'In Progress', 'Completed'],
  'Requirement': ['Draft', 'In Review', 'Approved', 'Implemented'],
  'Test Case': ['Draft', 'Ready for Test', 'Passed', 'Failed', 'Blocked'],
  'Defect': ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopened']
};

const ITEM_PRIORITIES: ItemPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export function FilterBar({
  selectedTypes,
  selectedStatuses,
  selectedPriorities,
  onTypeChange,
  onStatusChange,
  onPriorityChange,
  onClearAll
}: FilterBarProps) {
  const hasFilters = selectedTypes.length > 0 || selectedStatuses.length > 0 || selectedPriorities.length > 0;

  // Get available statuses based on selected types
  const availableStatuses = selectedTypes.length > 0
    ? Array.from(new Set(selectedTypes.flatMap(type => ITEM_STATUSES[type])))
    : Object.values(ITEM_STATUSES).flat();

  const toggleType = (type: ItemType) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  const toggleStatus = (status: ItemStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const togglePriority = (priority: ItemPriority) => {
    if (selectedPriorities.includes(priority)) {
      onPriorityChange(selectedPriorities.filter(p => p !== priority));
    } else {
      onPriorityChange([...selectedPriorities, priority]);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Type</label>
        <div className="flex flex-wrap gap-2">
          {ITEM_TYPES.map(type => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedTypes.includes(type)
                  ? 'bg-fresh-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">
          Status {selectedTypes.length > 0 && <span className="text-gray-400">(for selected types)</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map(status => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedStatuses.includes(status)
                  ? 'bg-fresh-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Priority</label>
        <div className="flex flex-wrap gap-2">
          {ITEM_PRIORITIES.map(priority => {
            const colors = {
              Low: 'bg-gray-100 text-gray-700',
              Medium: 'bg-blue-100 text-blue-700',
              High: 'bg-orange-100 text-orange-700',
              Critical: 'bg-red-100 text-red-700'
            };
            
            return (
              <button
                key={priority}
                onClick={() => togglePriority(priority)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedPriorities.includes(priority)
                    ? 'bg-fresh-green text-white ring-2 ring-fresh-green ring-offset-1'
                    : `${colors[priority]} hover:opacity-75`
                }`}
              >
                {priority}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
