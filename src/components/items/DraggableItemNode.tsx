// Draggable wrapper for ItemNode using @dnd-kit/sortable

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItemNode } from './ItemNode';
import { TreeNode } from '../../utils/treeHelpers';

interface DraggableItemNodeProps {
  node: TreeNode;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: (id: number) => void;
  onSelect: (id: number) => void;
}

export function DraggableItemNode({
  node,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelect
}: DraggableItemNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ItemNode
        node={node}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onToggleExpand={onToggleExpand}
        onSelect={onSelect}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}
