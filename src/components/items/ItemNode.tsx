// Individual tree node with expand/collapse and type-specific styling

import React from 'react';
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { TreeNode } from '../../utils/treeHelpers';
import { getItemTypeColor, getItemTypeLabel, getStatusColor, getStatusLabel } from '../../utils/constants';

interface ItemNodeProps {
  node: TreeNode;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: (id: number) => void;
  onSelect: (id: number) => void;
  dragHandleProps?: any; // For drag-and-drop
  isDragging?: boolean;
}

export function ItemNode({
  node,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelect,
  dragHandleProps,
  isDragging
}: ItemNodeProps) {
  const hasChildren = node.children.length > 0;
  const typeColor = getItemTypeColor(node.type);
  const statusColor = getStatusColor(node.status);

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer border-l-4 transition-all
        ${isSelected ? 'bg-fresh-50 border-fresh-500' : 'border-transparent'}
        ${isDragging ? 'opacity-40' : 'opacity-100'}
      `}
      style={{ paddingLeft: `${node.level * 24 + 16}px` }}
      onClick={() => onSelect(node.id)}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="cursor-move text-gray-400 hover:text-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Expand/Collapse Chevron */}
      {hasChildren ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(node.id);
          }}
          className="p-0.5 hover:bg-gray-200 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      ) : (
        <div className="w-5" /> // Spacer for alignment
      )}

      {/* Type Badge */}
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded ${typeColor} flex-shrink-0`}
      >
        {getItemTypeLabel(node.type)}
        {node.type === 'requirement' && node.level && (
          <span className="ml-1 opacity-75">
            · {node.level.charAt(0).toUpperCase() + node.level.slice(1).replace('-', ' ')}
          </span>
        )}
      </span>

      {/* Item ID */}
      <span className="text-xs text-gray-500 font-mono flex-shrink-0">
        #{node.id}
      </span>

      {/* Title */}
      <span className="flex-1 truncate text-sm">
        {node.title}
      </span>

      {/* Status Badge */}
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded ${statusColor} flex-shrink-0`}
      >
        {getStatusLabel(node.status)}
      </span>

      {/* Priority Indicator */}
      {node.priority && (
        <span className={`
          text-xs font-medium flex-shrink-0
          ${node.priority === 'critical' ? 'text-red-600' : ''}
          ${node.priority === 'high' ? 'text-orange-600' : ''}
          ${node.priority === 'medium' ? 'text-yellow-600' : ''}
          ${node.priority === 'low' ? 'text-gray-500' : ''}
        `}>
          {node.priority.toUpperCase()}
        </span>
      )}

      {/* Child Count */}
      {hasChildren && (
        <span className="text-xs text-gray-500 flex-shrink-0">
          ({node.children.length})
        </span>
      )}
    </div>
  );
}
