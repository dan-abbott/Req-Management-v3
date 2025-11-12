// ItemTree - FIXED VERSION - All type errors resolved

import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  CollisionDetection,
  rectIntersection
} from '@dnd-kit/core';
import { TreeNode, buildTree, shouldExpandToLevel } from '../../utils/treeHelpers';
import { Item, RequirementLevel } from '../../types';
import { TreeControls } from './TreeControls';
import { DroppableItemNode } from './DroppableItemNode';
import { RootDropZone } from './RootDropZone';

interface ItemTreeProps {
  items: Item[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onMove: (movedId: number, newParentId: number | null) => Promise<void>;
}

export function ItemTree({ items, selectedId, onSelect, onMove }: ItemTreeProps) {
  const tree = useMemo(() => buildTree(items), [items]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isOverRoot, setIsOverRoot] = useState(false);

  // Custom collision detection that prioritizes root zone
  const customCollisionDetection: CollisionDetection = (args) => {
    // First check if pointer is over root drop zone
    const pointerCollisions = pointerWithin(args);
    const rootZoneCollision = pointerCollisions.find(
      collision => collision.id === 'root-drop-zone'
    );
    
    if (rootZoneCollision) {
      return [rootZoneCollision];
    }
    
    // Otherwise use rect intersection for tree items
    return rectIntersection(args);
  };

  // Auto-expand all nodes on initial load
  useEffect(() => {
    if (items.length > 0 && expandedIds.size === 0) {
      const allIds = new Set(items.map(item => item.id));
      setExpandedIds(allIds);
    }
  }, [items.length, expandedIds.size]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleExpandToLevel = (targetLevel: RequirementLevel) => {
    const idsToExpand = new Set<number>();
    const traverse = (node: TreeNode) => {
      if (shouldExpandToLevel(node, targetLevel)) {
        idsToExpand.add(node.id);
      }
      // FIXED: node.children is TreeNode[], not number[]
      node.children.forEach(traverse);
    };
    tree.forEach(traverse);
    setExpandedIds(idsToExpand);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (event.over?.id === 'root-drop-zone') {
      setIsOverRoot(true);
    } else {
      setIsOverRoot(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setIsOverRoot(false);

    if (!over) return;

    const movedId = Number(active.id);
    
    // Check if dropped on root zone
    if (over.id === 'root-drop-zone') {
      try {
        const savedExpandedIds = new Set(expandedIds);
        await onMove(movedId, null);
        setExpandedIds(savedExpandedIds);
      } catch (error) {
        console.error('Failed to move item:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        alert('Failed to move item. ' + message);
      }
      return;
    }

    // Dropped on another item
    if (active.id === over.id) return;

    const newParentId = Number(over.id);

    try {
      const savedExpandedIds = new Set(expandedIds);
      await onMove(movedId, newParentId);
      savedExpandedIds.add(newParentId);
      setExpandedIds(savedExpandedIds);
    } catch (error) {
      console.error('Failed to move item:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to move item. ' + message);
    }
  };

  const renderNode = (node: TreeNode) => {
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

        {isExpanded && node.children.length > 0 && (
          <div>
            {/* FIXED: node.children is already TreeNode[], so map directly */}
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  const activeNode = useMemo(() => {
    if (!activeId) return null;
    
    const findNodeById = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === activeId) return node;
        // FIXED: node.children is TreeNode[], not number[]
        const found = findNodeById(node.children);
        if (found) return found;
      }
      return null;
    };
    
    return findNodeById(tree);
  }, [activeId, tree]);

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
    <div className="flex flex-col gap-4">
      <TreeControls
        onCollapseAll={handleCollapseAll}
        onExpandToLevel={handleExpandToLevel}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* ROOT DROP ZONE */}
        <RootDropZone isOver={isOverRoot} />

        {/* TREE */}
        <div className="space-y-1">
          {tree.map(node => renderNode(node))}
        </div>

        {/* DRAG OVERLAY */}
        <DragOverlay>
          {activeNode ? (
            <div className="bg-white shadow-xl rounded-lg border-2 border-[#3FB95A] p-3 opacity-90">
              <div className="font-medium text-gray-900">
                #{activeNode.id} - {activeNode.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
