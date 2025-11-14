// FilterBar - Compact layout with 3 filters on single line

import { Multiselect } from '../common/Multiselect';
import { ItemType, ItemStatus, Priority } from '../../types';
import {
  ITEM_TYPES,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from '../../utils/constants';

interface FilterBarProps {
  selectedTypes: ItemType[];
  selectedStatuses: ItemStatus[];
  selectedPriorities: Priority[];
  onTypesChange: (types: ItemType[]) => void;
  onStatusesChange: (statuses: ItemStatus[]) => void;
  onPrioritiesChange: (priorities: Priority[]) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  selectedTypes,
  selectedStatuses,
  selectedPriorities,
  onTypesChange,
  onStatusesChange,
  onPrioritiesChange,
  onClearFilters,
}: FilterBarProps) {
  // Get available statuses based on selected types
  const availableStatuses = () => {
    if (selectedTypes.length === 0) {
      // No types selected - show all unique statuses
      const allStatuses = new Set<ItemStatus>();
      Object.values(STATUS_OPTIONS).forEach(statuses => {
        statuses.forEach(s => allStatuses.add(s.value));
      });
      return Array.from(allStatuses).map(value => ({
        value,
        label: value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      }));
    }
    
    if (selectedTypes.length === 1) {
      // Single type selected - show its statuses
      return STATUS_OPTIONS[selectedTypes[0]];
    }
    
    // Multiple types - show intersection of statuses
    const statusSets = selectedTypes.map(type => 
      new Set(STATUS_OPTIONS[type].map(s => s.value))
    );
    const intersection = statusSets.reduce((acc, set) => 
      new Set([...acc].filter(x => set.has(x)))
    );
    
    return Array.from(intersection).map(value => ({
      value,
      label: STATUS_OPTIONS[selectedTypes[0]].find(s => s.value === value)?.label || value
    }));
  };

  const hasActiveFilters = selectedTypes.length > 0 || 
                           selectedStatuses.length > 0 || 
                           selectedPriorities.length > 0;

  return (
    <div className="space-y-2">
      {/* Three filters on one line - narrower widths */}
      <div className="flex gap-2">
        {/* Type Filter - 30% width */}
        <div className="flex-[0_0_30%]">
          <Multiselect
            label="Type"
            options={ITEM_TYPES}
            selected={selectedTypes}
            onChange={(values) => onTypesChange(values as ItemType[])}
            placeholder="All"
          />
        </div>

        {/* Status Filter - 35% width */}
        <div className="flex-[0_0_35%]">
          <Multiselect
            label="Status"
            options={availableStatuses()}
            selected={selectedStatuses}
            onChange={(values) => onStatusesChange(values as ItemStatus[])}
            placeholder="All"
          />
        </div>

        {/* Priority Filter - 30% width */}
        <div className="flex-[0_0_30%]">
          <Multiselect
            label="Priority"
            options={PRIORITY_OPTIONS}
            selected={selectedPriorities}
            onChange={(values) => onPrioritiesChange(values as Priority[])}
            placeholder="All"
          />
        </div>
      </div>

      {/* Clear Filters Button - compact */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full text-xs font-medium text-gray-600 hover:text-gray-800 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
