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
        mb-4 p-4 rounded-lg border-2 border-dashed text-center transition-all
        pointer-events-auto
        ${isOver 
          ? 'border-[#3FB95A] bg-[#3FB95A] bg-opacity-10 text-[#3FB95A]' 
          : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400'
        }
      `}
      style={{ 
        minHeight: '60px',
        display: 'block',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className="text-sm">
        {isOver 
          ? '⬇ Drop here to move to root level' 
          : '↓ Drop here to move item to root level'}
      </div>
    </div>
  );
}
