// ResizablePanels - Draggable divider between two panels

import { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePanelsProps {
  left: ReactNode;
  right: ReactNode;
  defaultLeftWidth?: number; // percentage
  minLeftWidth?: number; // percentage
  maxLeftWidth?: number; // percentage
}

export function ResizablePanels({ 
  left, 
  right,
  defaultLeftWidth = 40,
  minLeftWidth = 25,
  maxLeftWidth = 75
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain width
      const constrainedWidth = Math.min(Math.max(newLeftWidth, minLeftWidth), maxLeftWidth);
      setLeftWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  return (
    <div ref={containerRef} className="flex h-full relative">
      {/* Left Panel */}
      <div 
        style={{ width: `${leftWidth}%` }}
        className="flex-shrink-0"
      >
        {left}
      </div>

      {/* Draggable Divider */}
      <div
        className={`w-1 bg-gray-200 hover:bg-[#3FB95A] cursor-col-resize flex-shrink-0 relative group ${
          isDragging ? 'bg-[#3FB95A]' : ''
        }`}
        onMouseDown={() => setIsDragging(true)}
      >
        {/* Visual handle */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center">
          <div className="w-1 h-8 bg-gray-300 rounded-full group-hover:bg-[#3FB95A] opacity-0 group-hover:opacity-100 transition-opacity">
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div 
        style={{ width: `${100 - leftWidth}%` }}
        className="flex-1 min-w-0"
      >
        {right}
      </div>
    </div>
  );
}
