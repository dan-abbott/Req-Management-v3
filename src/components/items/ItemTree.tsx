// Main tree view component with expand/collapse state management (FIXED)

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { TreeNode, buildTree, shouldExpandToLevel } from '../../utils/treeHelpers';
import { Item, RequirementLevel } from '../../types';
import { TreeControls } from './TreeControls';
import { DraggableItemNode } from './DraggableItemNode';

interface ItemTreeProps {
  items: Item[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onMove: (movedId: number, newParentId: number | null) => Promise<void>;
}

export function ItemTree({ items, selectedId, onSelect, onMove }: ItemTreeProps) {
  // Build tree structure
  const tree = useMemo(() => buildTree(items), [items]);

  // Expand/collapse state
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Toggle expand/collapse
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Collapse all nodes
  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Expand to specific requirement level
  const handleExpandToLevel = (targetLevel: RequirementLevel) => {
    const idsToExpand = new Set<number>();

    const traverse = (node: TreeNode) => {
      if (shouldExpandToLevel(node, targetLevel)) {
        idsToExpand.add(node.id);
      }
      node.children.forEach(traverse);
    };

    tree.forEach(traverse);
    setExpandedIds(idsToExpand);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const movedId = Number(active.id);
    const newParentId = Number(over.id);

    // Call parent handler to update database
    onMove(movedId, newParentId).catch(error => {
      console.error('Failed to move item:', error);
      alert('Failed to move item. ' + error.message);
    });
  };

  // Flatten tree for sortable context (all items at all levels)
  const flatItems = useMemo(() => {
    const result: TreeNode[] = [];
    const traverse = (node: TreeNode) => {
      result.push(node);
      if (expandedIds.has(node.id)) {
        node.children.forEach(traverse);
      }
    };
    tree.forEach(traverse);
    return result;
  }, [tree, expandedIds]);

  // Recursive render function
  const renderNode = (node: TreeNode) => {
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;

    return (
      <div key={node.id}>
        <DraggableItemNode
          node={node}
          isExpanded={isExpanded}
          isSelected={isSelected}
          onToggleExpand={toggleExpand}
          onSelect={onSelect}
        />

        {/* Recursively render children if expanded */}
        {isExpanded && node.children.length > 0 && (
          <div>
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Empty state
  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-6xl mb-4">📋</div>
        <div className="text-lg font-medium">No items yet</div>
        <div className="text-sm">Create your first item to get started</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tree Controls */}
      <TreeControls
        onCollapseAll={handleCollapseAll}
        onExpandToLevel={handleExpandToLevel}
      />

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={flatItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {tree.map(node => renderNode(node))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
