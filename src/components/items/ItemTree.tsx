// ItemTree - Fixed root drop zone and better collision detection

import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent
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
  const tree = useMemo(() => buildTree(items), [items]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isOverRoot, setIsOverRoot] = useState(false);

  // Root level drop zone
  const {
    setNodeRef: setRootDropRef
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
  }, [items.length]);

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
      node.children.forEach(traverse);
    };
    tree.forEach(traverse);
    setExpandedIds(idsToExpand);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  // Track when hovering over root zone
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
        
        console.log('Moving to root level:', movedId);
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
      
      console.log('Moving to parent:', movedId, '→', newParentId);
      await onMove(movedId, newParentId);
      
      savedExpandedIds.add(newParentId);
      setExpandedIds(savedExpandedIds);
    } catch (error) {
      console.error('Failed to move item:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to move item. ' + message);
    }
  };

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

        {isExpanded && node.children.length > 0 && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
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
    <div className="flex flex-col h-full">
      <TreeControls
        onCollapseAll={handleCollapseAll}
        onExpandToLevel={handleExpandToLevel}
      />

      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* ROOT LEVEL DROP ZONE */}
          <div
            ref={setRootDropRef}
            style={{
              padding: '16px',
              margin: '8px',
              border: '2px dashed',
              borderColor: isOverRoot ? '#3FB95A' : '#d1d5db',
              backgroundColor: isOverRoot ? '#f0fdf4' : '#f9fafb',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'all 0.2s',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{
              fontSize: '14px',
              color: isOverRoot ? '#15803d' : '#6b7280',
              fontWeight: isOverRoot ? '600' : '400'
            }}>
              {isOverRoot ? (
                <>⬇ Drop here to move to root level (un-nest)</>
              ) : (
                <>Drop here to move item to root level</>
              )}
            </div>
          </div>

          {tree.map(node => renderNode(node))}
          
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
