// RootDropZone.tsx - Separate component for root-level drop zone

import { useDroppable } from '@dnd-kit/core';

interface RootDropZoneProps {
  isOver: boolean;
}

export function RootDropZone({ isOver }: RootDropZoneProps) {
  const { setNodeRef } = useDroppable({
    id: 'root-drop-zone',
    data: { 
      type: 'root',
      accepts: ['item']
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        mb-8 p-8 rounded-lg border-2 border-dashed text-center transition-all font-medium
        pointer-events-auto
        ${isOver 
          ? 'border-[#3FB95A] bg-[#3FB95A] bg-opacity-20 text-[#3FB95A] shadow-lg scale-105' 
          : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400 hover:bg-gray-100'
        }
      `}
      style={{ 
        minHeight: '100px',
        display: 'block',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className="text-lg">
        {isOver 
          ? '⬇ Drop here to move to root level (un-nest)' 
          : '↓ Drop here to move item to root level'}
      </div>
      {!isOver && (
        <div className="text-sm text-gray-400 mt-2">
          Drag items here to remove nesting
        </div>
      )}
    </div>
  );
}
