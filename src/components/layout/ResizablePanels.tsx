// ResizablePanels - Draggable divider between two panels with independent scrolling

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
    <div ref={containerRef} className="flex h-full w-full relative">
      {/* Left Panel - Independent scroll */}
      <div 
        style={{ width: `${leftWidth}%` }}
        className="flex-shrink-0 overflow-y-auto overflow-x-hidden"
      >
        {left}
      </div>

      {/* Draggable Divider */}
      <div
        className={`w-1 bg-gray-300 hover:bg-[#3FB95A] cursor-col-resize flex-shrink-0 relative group transition-colors ${
          isDragging ? 'bg-[#3FB95A]' : ''
        }`}
        onMouseDown={() => setIsDragging(true)}
      >
        {/* Visual handle */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center">
          <div className={`w-1 h-8 rounded-full transition-all ${
            isDragging ? 'bg-[#3FB95A] opacity-100' : 'bg-gray-400 opacity-0 group-hover:opacity-100'
          }`}>
          </div>
        </div>
      </div>

      {/* Right Panel - Independent scroll */}
      <div 
        style={{ width: `${100 - leftWidth - 0.1}%` }}
        className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden"
      >
        {right}
      </div>
    </div>
  );
}
