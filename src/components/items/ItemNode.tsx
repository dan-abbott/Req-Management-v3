// ItemNode - Enhanced drag-and-drop visual feedback

import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { TreeNode } from '../../utils/treeHelpers';
import { getItemTypeColor, getItemTypeLabel, getStatusColor, getStatusLabel } from '../../utils/constants';

interface ItemNodeProps {
  node: TreeNode;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: (id: number) => void;
  onSelect: (id: number) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
  isOver?: boolean; // NEW: Is this a valid drop target?
}

export function ItemNode({
  node,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelect,
  dragHandleProps,
  isDragging,
  isOver
}: ItemNodeProps) {
  const hasChildren = node.children.length > 0;
  const typeColor = getItemTypeColor(node.type);
  const statusColor = getStatusColor(node.status);

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-all
        ${isSelected ? 'bg-fresh-50 border-l-4 border-fresh-500' : 'border-l-4 border-transparent'}
        ${isDragging ? 'opacity-40 bg-gray-100' : 'opacity-100'}
        ${isOver ? 'bg-fresh-100 border-l-4 border-fresh-600 shadow-lg' : ''}
      `}
      style={{ 
        paddingLeft: `${node.depth * 24 + 16}px`,
        position: 'relative'
      }}
      onClick={() => onSelect(node.id)}
    >
      {/* Drop indicator overlay */}
      {isOver && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(63, 185, 90, 0.1)',
            border: '2px dashed #3FB95A',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#3FB95A',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            ↓ Drop here to nest under this item
          </div>
        </div>
      )}

      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="cursor-move text-gray-400 hover:text-gray-600 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
        title="Drag to move item"
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
          className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      ) : (
        <div className="w-5 flex-shrink-0" />
      )}

      {/* Type Badge */}
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeColor} flex-shrink-0`}>
        {getItemTypeLabel(node.type)}
        {node.type === 'requirement' && node.level && (
          <span className="ml-1 opacity-75">
            · {node.level.toString().charAt(0).toUpperCase() + node.level.toString().slice(1).replace('-', ' ')}
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
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColor} flex-shrink-0`}>
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
