// DraggableItemNode - Enhanced with drop zone visual feedback

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
    isDragging,
    isOver
  } = useSortable({ 
    id: node.id,
    data: {
      type: 'item',
      node
    }
  });

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
        isOver={isOver} // Pass drop zone state
      />
    </div>
  );
}
