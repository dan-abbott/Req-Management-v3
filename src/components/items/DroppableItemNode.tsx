// DroppableItemNode - Uses draggable + droppable (not sortable) for tree nesting

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ItemNode } from './ItemNode';
import { TreeNode } from '../../utils/treeHelpers';

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
  onSelect
}: DroppableItemNodeProps) {
  // Make draggable
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging
  } = useDraggable({
    id: node.id,
    data: { node }
  });

  // Make droppable (can receive dropped items)
  const {
    setNodeRef: setDropRef,
    isOver
  } = useDroppable({
    id: node.id,
    data: { node }
  });

  // Combine refs (item is both draggable AND droppable)
  const setRefs = (element: HTMLDivElement | null) => {
    setDragRef(element);
    setDropRef(element);
  };

  return (
    <div ref={setRefs}>
      <ItemNode
        node={node}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onToggleExpand={onToggleExpand}
        onSelect={onSelect}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging || isBeingDragged}
        isOver={isOver && !isDragging} // Only show drop zone if not dragging self
      />
    </div>
  );
}
