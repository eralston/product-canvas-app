import React, { useState, useRef, useEffect } from 'react';

interface CardColorProps {
  id: string;
  content: string;
  initialX: number;
  initialY: number;
  canvasWidth: number;
  canvasHeight: number;
  onZIndexChange: (id: string) => void;
  zIndex: number;
}

const CardColor: React.FC<CardColorProps> = ({
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
        absolute rounded-lg cursor-move select-none 
        transition-all duration-150 ease-out border-2
        ${isDragging 
          ? 'bg-amber-300 border-amber-400 text-amber-900' 
          : 'bg-yellow-200 border-yellow-300 text-yellow-800 hover:bg-yellow-250 hover:border-yellow-400'
        }
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        zIndex: zIndex,
        // Minimal shadow - let color do the work
        boxShadow: isDragging 
          ? '0 8px 25px -5px rgba(0, 0, 0, 0.15)' 
          : '0 2px 8px -2px rgba(0, 0, 0, 0.1)',
        // Subtle brightness and saturation shift
        filter: isDragging ? 'brightness(1.1) saturate(1.2)' : 'brightness(1) saturate(1)'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="p-2 h-full flex items-center justify-center">
        <p className="text-xs font-medium text-center leading-tight transition-colors duration-150">
          {content}
        </p>
      </div>
    </div>
  );
};

export default CardColor;