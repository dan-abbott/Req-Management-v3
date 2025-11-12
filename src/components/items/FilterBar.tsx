import { ItemType, ItemStatus, Priority } from '../../types';
import { ITEM_TYPES, STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../utils/constants';

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

  const toggleType = (type: ItemType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const toggleStatus = (status: ItemStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };

  const togglePriority = (priority: Priority) => {
    if (selectedPriorities.includes(priority)) {
      onPrioritiesChange(selectedPriorities.filter(p => p !== priority));
    } else {
      onPrioritiesChange([...selectedPriorities, priority]);
    }
  };

  const hasActiveFilters = selectedTypes.length > 0 || 
                           selectedStatuses.length > 0 || 
                           selectedPriorities.length > 0;

  return (
    <div className="space-y-3">
      {/* Type Filters */}
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1.5">Type</div>
        <div className="flex flex-wrap gap-1.5">
          {ITEM_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => toggleType(type.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                selectedTypes.includes(type.value)
                  ? 'bg-[#3FB95A] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1.5">Status</div>
        <div className="flex flex-wrap gap-1.5">
          {availableStatuses().map(status => (
            <button
              key={status.value}
              onClick={() => toggleStatus(status.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                selectedStatuses.includes(status.value)
                  ? 'bg-[#3FB95A] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filters */}
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1.5">Priority</div>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITY_OPTIONS.map(priority => (
            <button
              key={priority.value}
              onClick={() => togglePriority(priority.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                selectedPriorities.includes(priority.value)
                  ? 'bg-[#3FB95A] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {priority.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full text-xs font-medium text-gray-600 hover:text-gray-800 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
