import React, { useState, useRef, useEffect } from 'react';

interface CardShadowAccessibleProps {
  id: string;
  content: string;
  initialX: number;
  initialY: number;
  canvasWidth: number;
  canvasHeight: number;
  onZIndexChange: (id: string) => void;
  zIndex: number;
}

const CardShadowAccessible: React.FC<CardShadowAccessibleProps> = ({
  id,
  content,
  initialX,
  initialY,
  canvasWidth,
  canvasHeight,
  onZIndexChange,
  zIndex
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 72;
  const CARD_HEIGHT = 72;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onZIndexChange(id);
    
    const canvas = cardRef.current?.parentElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - canvasRect.left - position.x,
      y: e.clientY - canvasRect.top - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cardRef.current) return;

      const canvas = cardRef.current.parentElement;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      const constrainedX = Math.max(0, Math.min(newX, canvasWidth - CARD_WIDTH));
      const constrainedY = Math.max(0, Math.min(newY, canvasHeight - CARD_HEIGHT));

      setPosition({ x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, canvasWidth, canvasHeight]);

  return (
    <div
      ref={cardRef}
      className={`
        absolute bg-yellow-200 rounded-lg cursor-move
        select-none transition-all duration-200 ease-out border-2
        ${isDragging 
          ? 'border-amber-600' 
          : 'border-yellow-300 hover:border-yellow-400'
        }
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        zIndex: zIndex,
        // Dramatic shadow changes for visual appeal
        boxShadow: isDragging 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 8px 16px -4px rgba(251, 191, 36, 0.4)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(251, 191, 36, 0.2)',
        // Very subtle transform - let shadows and border do the heavy lifting
        transform: isDragging ? 'translateY(-2px)' : 'translateY(0px)'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="p-2 h-full flex items-center justify-center">
        <p className="text-xs text-yellow-800 font-medium text-center leading-tight">
          {content}
        </p>
      </div>
    </div>
  );
};

export default CardShadowAccessible;