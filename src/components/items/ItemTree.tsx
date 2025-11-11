// Item Tree Component (Updated for Sprint 3)

import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { TreeNode } from '../../types';
import { DroppableItemNode } from './DroppableItemNode';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ItemTreeProps {
  items: TreeNode[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onMove: (nodeId: number, newParentId: number | null) => void;
  expandedNodes: Set<number>;
  onExpandedChange: (expanded: Set<number>) => void;
}

export function ItemTree({ 
  items, 
  selectedId, 
  onSelect, 
  onMove,
  expandedNodes,
  onExpandedChange 
}: ItemTreeProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      onMove(active.id as number, over.id as number);
    }
    
    setActiveId(null);
  };

  const handleToggle = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    onExpandedChange(newExpanded);
  };

  const handleExpandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(items);
    onExpandedChange(allIds);
  };

  const handleCollapseAll = () => {
    onExpandedChange(new Set());
  };

  const activeItem = activeId ? findNodeById(items, activeId) : null;

  return (
    <div className="space-y-3">
      {/* Tree Controls */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleExpandAll}
            className="text-fresh-green hover:text-green-600 font-medium"
          >
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleCollapseAll}
            className="text-fresh-green hover:text-green-600 font-medium"
          >
            Collapse All
          </button>
        </div>
      )}

      {/* Tree */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-1">
          {items.map(item => (
            <DroppableItemNode
              key={item.id}
              node={item}
              level={0}
              isSelected={item.id === selectedId}
              isExpanded={expandedNodes.has(item.id)}
              onSelect={onSelect}
              onToggle={handleToggle}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem && (
            <div className="bg-white border-2 border-fresh-green rounded-lg p-3 shadow-lg opacity-90">
              <div className="font-medium text-gray-900">{activeItem.title}</div>
              <div className="text-xs text-gray-500 mt-1">{activeItem.type}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Helper to find node by ID
function findNodeById(nodes: TreeNode[], id: number): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}
