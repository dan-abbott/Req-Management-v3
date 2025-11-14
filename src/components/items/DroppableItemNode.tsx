// DroppableItemNode - With consistent TYPE_COLORS throughout tree

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { TreeNode } from '../../utils/treeHelpers';

// TYPE_COLORS - Consistent across all nodes
const TYPE_COLORS = {
  epic: 'bg-purple-100 text-purple-800',
  requirement: 'bg-blue-100 text-blue-800',
  'test-case': 'bg-green-100 text-green-800',
  defect: 'bg-red-100 text-red-800',
} as const;

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  'in-review': 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  'ready-for-test': 'bg-blue-100 text-blue-800',
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  'not-started': 'bg-gray-100 text-gray-700',
  'in-process': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  backlog: 'bg-gray-100 text-gray-700',
} as const;

const PRIORITY_COLORS = {
  critical: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-yellow-600',
  low: 'text-gray-600',
} as const;

interface DroppableItemNodeProps {
  node: TreeNode;
  isExpanded: boolean;
  isSelected: boolean;
  isBeingDragged: boolean;
  onToggleExpand: (id: number) => void;
  onSelect: (id: number) => void;
}

export function DroppableItemNode({
  node,
  isExpanded,
  isSelected,
  isBeingDragged,
  onToggleExpand,
  onSelect,
}: DroppableItemNodeProps) {
  const hasChildren = node.children.length > 0;

  // Draggable setup
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: node.id,
    data: { node },
  });

  // Droppable setup
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: node.id,
    data: { node },
  });

  // Combine refs
  const setRefs = (element: HTMLDivElement | null) => {
    setDragRef(element);
    setDropRef(element);
  };

  // Get consistent colors
  const typeColor = TYPE_COLORS[node.type as keyof typeof TYPE_COLORS] || 'bg-gray-100 text-gray-800';
  const statusColor = STATUS_COLORS[node.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-700';
  const priorityColor = node.priority ? PRIORITY_COLORS[node.priority as keyof typeof PRIORITY_COLORS] : '';

  return (
    <div
      ref={setRefs}
      className={`
        flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer border-l-4 transition-all
        ${isSelected ? 'bg-[#3FB95A] bg-opacity-10 border-[#3FB95A]' : 'border-transparent'}
        ${isOver ? 'bg-[#3FB95A] bg-opacity-20' : ''}
        ${isBeingDragged || isDragging ? 'opacity-40' : 'opacity-100'}
      `}
      style={{ paddingLeft: `${(node.level || 0) * 24 + 16}px` }}
      onClick={() => onSelect(node.id)}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        className="cursor-move text-gray-400 hover:text-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Expand/Collapse */}
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

      {/* Type Badge - ALWAYS uses TYPE_COLORS */}
      <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${typeColor}`}>
        {node.type === 'epic' && 'Epic'}
        {node.type === 'requirement' && 'Requirement'}
        {node.type === 'test-case' && 'Test Case'}
        {node.type === 'defect' && 'Defect'}
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

      {/* Status Badge - ALWAYS uses STATUS_COLORS */}
      <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${statusColor}`}>
        {node.status.split('-').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </span>

      {/* Priority - ALWAYS uses PRIORITY_COLORS */}
      {node.priority && (
        <span className={`text-xs font-bold flex-shrink-0 ${priorityColor}`}>
          {node.priority.toUpperCase()}
        </span>
      )}
    </div>
  );
}
