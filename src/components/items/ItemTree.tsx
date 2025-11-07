// ItemTree - Fixed to preserve expanded state and allow root-level drops

import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { TreeNode, buildTree, shouldExpandToLevel } from '../../utils/treeHelpers';
import { Item, RequirementLevel } from '../../types';
import { TreeControls } from './TreeControls';
import { DroppableItemNode } from './DroppableItemNode';

interface ItemTreeProps {
  items: Item[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onMove: (movedId: number, newParentId: number | null) => Promise<void>;
}

export function ItemTree({ items, selectedId, onSelect, onMove }: ItemTreeProps) {
  // Build tree structure
  const tree = useMemo(() => buildTree(items), [items]);

  // Expand/collapse state - PRESERVED across refreshes
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  
  // Drag state
  const [activeId, setActiveId] = useState<number | null>(null);

  // Root level drop zone
  const {
    setNodeRef: setRootDropRef,
    isOver: isOverRoot
  } = useDroppable({
    id: 'root-drop-zone',
    data: { isRoot: true }
  });

  // Auto-expand all nodes on initial load
  useEffect(() => {
    if (items.length > 0 && expandedIds.size === 0) {
      const allIds = new Set(items.map(item => item.id));
      setExpandedIds(allIds);
    }
  }, [items.length]); // Only run when items first load

  // Drag sensor
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
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

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over) return;

    const movedId = Number(active.id);
    
    // Check if dropped on root zone
    if (over.id === 'root-drop-zone') {
      try {
        // SAVE expanded state before move
        const savedExpandedIds = new Set(expandedIds);
        
        await onMove(movedId, null); // null = root level
        
        // RESTORE expanded state after move
        setExpandedIds(savedExpandedIds);
      } catch (error) {
        console.error('Failed to move item:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        alert('Failed to move item. ' + message);
      }
      return;
    }

    // Dropped on another item
    if (active.id === over.id) return; // Same item

    const newParentId = Number(over.id);

    try {
      // SAVE expanded state before move
      const savedExpandedIds = new Set(expandedIds);
      
      await onMove(movedId, newParentId);
      
      // RESTORE expanded state after move
      // Also expand the new parent so you can see the moved item
      savedExpandedIds.add(newParentId);
      setExpandedIds(savedExpandedIds);
    } catch (error) {
      console.error('Failed to move item:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to move item. ' + message);
    }
  };

  // Recursive render function
  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;
    const isBeingDragged = activeId === node.id;

    return (
      <div key={node.id}>
        <DroppableItemNode
          node={node}
          isExpanded={isExpanded}
          isSelected={isSelected}
          isBeingDragged={isBeingDragged}
          onToggleExpand={toggleExpand}
          onSelect={onSelect}
        />

        {/* Recursively render children if expanded */}
        {isExpanded && node.children.length > 0 && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Get active node for drag overlay
  const activeNode = useMemo(() => {
    if (!activeId) return null;
    
    const findNodeById = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === activeId) return node;
        const found = findNodeById(node.children);
        if (found) return found;
      }
      return null;
    };
    
    return findNodeById(tree);
  }, [activeId, tree]);

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
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* ROOT LEVEL DROP ZONE - At the top */}
          <div
            ref={setRootDropRef}
            className={`
              px-4 py-3 border-2 border-dashed transition-all mb-2 mx-2 mt-2 rounded
              ${isOverRoot 
                ? 'border-fresh-500 bg-fresh-50' 
                : 'border-gray-300 bg-gray-50'
              }
            `}
          >
            <div className={`text-sm text-center ${isOverRoot ? 'text-fresh-700 font-semibold' : 'text-gray-500'}`}>
              {isOverRoot ? (
                <>⬇ Drop here to move to root level (un-nest)</>
              ) : (
                <>Drop here to move item to root level</>
              )}
            </div>
          </div>

          {/* Tree Items */}
          {tree.map(node => renderNode(node))}
          
          {/* Drag Overlay */}
          <DragOverlay>
            {activeNode && (
              <div 
                className="bg-white border-2 border-fresh-500 rounded shadow-lg opacity-90"
                style={{ padding: '8px', minWidth: '300px' }}
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {activeNode.type}
                  </span>
                  <span className="text-sm font-medium">{activeNode.title}</span>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
