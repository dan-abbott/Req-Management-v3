// FilterBar - Updated with multiselect dropdowns

import { ItemType, ItemStatus, Priority } from '../../types';
import { ITEM_TYPES, STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../utils/constants';
import { Multiselect } from '../common/Multiselect';

interface FilterBarProps {
  selectedTypes: ItemType[];
  onTypesChange: (types: ItemType[]) => void;
  selectedStatuses: ItemStatus[];
  onStatusesChange: (statuses: ItemStatus[]) => void;
  selectedPriorities: Priority[];
  onPrioritiesChange: (priorities: Priority[]) => void;
  onClearFilters: () => void;
}

export default function FilterBar({
  selectedTypes,
  onTypesChange,
  selectedStatuses,
  onStatusesChange,
  selectedPriorities,
  onPrioritiesChange,
  onClearFilters
}: FilterBarProps) {
  // Get available statuses based on selected types
  const availableStatuses = () => {
    if (selectedTypes.length === 0) {
      // Show all unique statuses
      const allStatuses = new Set<ItemStatus>();
      Object.values(STATUS_OPTIONS).forEach(options => {
        options.forEach(opt => allStatuses.add(opt.value));
      });
      return Array.from(allStatuses).map(value => ({
        value,
        label: STATUS_OPTIONS.epic.find(s => s.value === value)?.label ||
               STATUS_OPTIONS.requirement.find(s => s.value === value)?.label ||
               STATUS_OPTIONS['test-case'].find(s => s.value === value)?.label ||
               STATUS_OPTIONS.defect.find(s => s.value === value)?.label ||
               value
      }));
    }

    // Show statuses for selected types
    const statuses = new Set<ItemStatus>();
    selectedTypes.forEach(type => {
      STATUS_OPTIONS[type].forEach(opt => statuses.add(opt.value));
    });
    return Array.from(statuses).map(value => ({
      value,
      label: STATUS_OPTIONS[selectedTypes[0]].find(s => s.value === value)?.label || value
    }));
  };

  const hasActiveFilters = selectedTypes.length > 0 || 
                           selectedStatuses.length > 0 || 
                           selectedPriorities.length > 0;

  return (
    <div className="space-y-3">
      {/* Type Filter */}
      <Multiselect
        label="Type"
        options={ITEM_TYPES}
        selected={selectedTypes}
        onChange={(values) => onTypesChange(values as ItemType[])}
        placeholder="All types"
      />

      {/* Status Filter */}
      <Multiselect
        label="Status"
        options={availableStatuses()}
        selected={selectedStatuses}
        onChange={(values) => onStatusesChange(values as ItemStatus[])}
        placeholder="All statuses"
      />

      {/* Priority Filter */}
      <Multiselect
        label="Priority"
        options={PRIORITY_OPTIONS}
        selected={selectedPriorities}
        onChange={(values) => onPrioritiesChange(values as Priority[])}
        placeholder="All priorities"
      />

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full text-xs font-medium text-gray-600 hover:text-gray-800 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
