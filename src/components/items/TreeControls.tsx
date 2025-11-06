// Tree navigation controls

import React from 'react';
import { ChevronDown, Minimize2 } from 'lucide-react';
import { RequirementLevel } from '../../types';
import { REQUIREMENT_LEVELS } from '../../utils/treeHelpers';

interface TreeControlsProps {
  onCollapseAll: () => void;
  onExpandToLevel: (level: RequirementLevel) => void;
}

export function TreeControls({ onCollapseAll, onExpandToLevel }: TreeControlsProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-gray-50">
      {/* Collapse All Button */}
      <button
        onClick={onCollapseAll}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
        title="Collapse all nodes"
      >
        <Minimize2 className="w-4 h-4" />
        Collapse All
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Expand to Level */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Expand to Level:</label>
        <select
          onChange={(e) => {
            const level = e.target.value as RequirementLevel;
            if (level) onExpandToLevel(level);
          }}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500 focus:border-transparent"
          defaultValue=""
        >
          <option value="">Select level...</option>
          {REQUIREMENT_LEVELS.map(level => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Info text */}
      <div className="ml-auto text-xs text-gray-500">
        Use chevrons to expand/collapse individual items
      </div>
    </div>
  );
}
