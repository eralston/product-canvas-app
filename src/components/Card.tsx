import React, { useState, useRef, useEffect } from 'react';
import { CardColorPalette, getColorPaletteById } from '../utils/cardColors';
import ColorPicker from './ColorPicker';

interface CardProps {
  id: string;
  content: string;
  initialX: number;
  initialY: number;
  canvasWidth: number;
  canvasHeight: number;
  onZIndexChange: (id: string) => void;
  onContentChange: (id: string, newContent: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onColorChange: (id: string, colorId: string) => void;
  onDelete: (id: string) => void;
  zIndex: number;
  colorId: string;
  startInEditMode?: boolean;
  onEditModeChange?: (isEditing: boolean) => void;
  scale?: number;
}

const Card: React.FC<CardProps> = ({
  id,
  content,
  initialX,
  initialY,
  canvasWidth,
  canvasHeight,
  onZIndexChange,
  onContentChange,
  onPositionChange,
  onColorChange,
  onDelete,
  zIndex,
  colorId,
  startInEditMode = false,
  onEditModeChange,
  scale = 1
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editContent, setEditContent] = useState(content);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  
  // Touch handling state
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const CHARACTER_LIMIT = 140;
  const MIN_CARD_WIDTH = 72;
  const MIN_CARD_HEIGHT = 72;
  const MAX_CARD_WIDTH = 164;
  const MAX_CARD_HEIGHT = 124;

  // Touch constants
  const DOUBLE_TAP_DELAY = 300; // ms
  const DRAG_THRESHOLD = 5; // pixels
  const LONG_PRESS_DELAY = 150; // ms

  // Get color palette for this card
  const colorPalette = getColorPaletteById(colorId);

  // Update position when initialX or initialY changes (when switching modes)
  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  // Calculate dynamic card size based on content length
  const calculateCardSize = (text: string) => {
    const length = text.length;
    
    if (length <= 20) {
      // Short text - use minimum size
      return { width: MIN_CARD_WIDTH, height: MIN_CARD_HEIGHT };
    }
    
    // Calculate size based on content length
    // Use a more generous scaling to prevent scrollbars
    const lengthFactor = Math.pow(length / CHARACTER_LIMIT, 0.6);
    
    const width = Math.min(
      MIN_CARD_WIDTH + (MAX_CARD_WIDTH - MIN_CARD_WIDTH) * lengthFactor,
      MAX_CARD_WIDTH
    );
    
    // Maintain roughly 4:3 aspect ratio for readability
    const height = Math.min(
      MIN_CARD_HEIGHT + (MAX_CARD_HEIGHT - MIN_CARD_HEIGHT) * lengthFactor,
      MAX_CARD_HEIGHT
    );
    
    return { width: Math.round(width), height: Math.round(height) };
  };

  const cardSize = calculateCardSize(isEditing ? editContent : content);

  // Helper function to extract coordinates from mouse or touch events
  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    } else if ('clientX' in e) {
      return { clientX: e.clientX, clientY: e.clientY };
    }
    return { clientX: 0, clientY: 0 };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    const touch = e.touches[0];
    
    setTouchStartTime(now);
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setHasMoved(false);
    
    // Check for double tap
    if (now - lastTouchTime < DOUBLE_TAP_DELAY) {
      // Double tap detected - enter edit mode
      setIsEditing(true);
      setEditContent(content);
      onZIndexChange(id);
      onEditModeChange?.(true);
      setLastTouchTime(0); // Reset to prevent triple tap
      return;
    }
    
    setLastTouchTime(now);
    
    // Start drag preparation
    onZIndexChange(id);
    
    const canvas = cardRef.current?.parentElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    
    setDragOffset({
      x: (touch.clientX - canvasRect.left) / scale - position.x,
      y: (touch.clientY - canvasRect.top) / scale - position.y
    });
    
    // Set up drag after a short delay to distinguish from tap
    setTimeout(() => {
      if (!hasMoved && touchStartTime === now) {
        setIsDragging(true);
      }
    }, LONG_PRESS_DELAY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isEditing) return;
    
    const touch = e.touches[0];
    const moveDistance = Math.sqrt(
      Math.pow(touch.clientX - touchStartPos.x, 2) + 
      Math.pow(touch.clientY - touchStartPos.y, 2)
    );
    
    if (moveDistance > DRAG_THRESHOLD) {
      setHasMoved(true);
      if (!isDragging) {
        setIsDragging(true);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isEditing) return;
    
    e.preventDefault();
    setIsDragging(false);
    setHasMoved(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return; // Don't drag while editing
    
    e.preventDefault();
    e.stopPropagation(); // Prevent canvas double-click when clicking card
    setIsDragging(true);
    onZIndexChange(id);
    
    const canvas = cardRef.current?.parentElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    
    // Account for canvas scaling when calculating drag offset
    setDragOffset({
      x: (e.clientX - canvasRect.left) / scale - position.x,
      y: (e.clientY - canvasRect.top) / scale - position.y
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent canvas double-click when double-clicking card
    setIsEditing(true);
    setEditContent(content);
    onZIndexChange(id); // Bring to front when editing
    onEditModeChange?.(true);
  };

  // Unified function to exit edit mode and save content
  const exitEditMode = () => {
    // Always save the current edit content (this will trigger deletion if empty)
    onContentChange(id, editContent);
    setIsEditing(false);
    onEditModeChange?.(false);
  };

  const cancelEdit = () => {
    setEditContent(content); // Reset to original content
    setIsEditing(false);
    onEditModeChange?.(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    // Enforce character limit
    if (newContent.length <= CHARACTER_LIMIT) {
      setEditContent(newContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      exitEditMode(); // Use unified exit function
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
    // Allow default behavior for copy (Ctrl+C), cut (Ctrl+X), paste (Ctrl+V)
  };

  const handleColorChange = (newColorId: string) => {
    onColorChange(id, newColorId);
  };

  const handleDeleteClick = () => {
    onDelete(id);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      // Focus and select all text when entering edit mode
      textareaRef.current.focus();
      if (content) {
        textareaRef.current.select();
      }
    }
  }, [isEditing]);

  // Separate useEffect for click-outside detection
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        // Check if click is on color picker - if so, don't close
        const target = e.target as Element;
        if (target.closest('.color-picker-container')) {
          return;
        }
        exitEditMode(); // Use unified exit function
      }
    };

    // Add listener to document
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, editContent]); // Include editContent as dependency to ensure latest content is saved

  useEffect(() => {
    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !cardRef.current || isEditing) return;

      e.preventDefault(); // Prevent scrolling and other default behaviors

      const canvas = cardRef.current.parentElement;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const coords = getEventCoordinates(e);
      
      // Account for canvas scaling when calculating new position
      const newX = (coords.clientX - canvasRect.left) / scale - dragOffset.x;
      const newY = (coords.clientY - canvasRect.top) / scale - dragOffset.y;

      const constrainedX = Math.max(0, Math.min(newX, canvasWidth - cardSize.width));
      const constrainedY = Math.max(0, Math.min(newY, canvasHeight - cardSize.height));

      const newPosition = { x: constrainedX, y: constrainedY };
      setPosition(newPosition);
      
      // Update the parent component with the new position
      onPositionChange(id, constrainedX, constrainedY);
    };

    const handleDragEnd = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    if (isDragging && !isEditing) {
      // Add both mouse and touch event listeners
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, dragOffset, canvasWidth, canvasHeight, isEditing, cardSize, scale, id, onPositionChange]);

  const currentCharCount = editContent.length;
  const remainingChars = CHARACTER_LIMIT - currentCharCount;

  // Build dynamic CSS classes based on color palette
  const cardClasses = `
    absolute rounded-lg select-none transition-all duration-200 ease-out border-2
    ${colorPalette.background}
    ${isEditing 
      ? `${colorPalette.editingBorder} cursor-text` 
      : isDragging 
        ? `${colorPalette.draggingBorder} cursor-move` 
        : `${colorPalette.border} ${colorPalette.hoverBorder} cursor-move`
    }
  `;

  // Build dynamic shadow based on color palette
  const cardShadow = isEditing
    ? '0 0 0 2px rgba(59, 130, 246, 0.3), 0 8px 25px -5px rgba(0, 0, 0, 0.15)'
    : isDragging 
      ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 8px 16px -4px ${colorPalette.shadowSecondary}`
      : `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px 0 ${colorPalette.shadowPrimary}`;

  return (
    <>
      <div
        ref={cardRef}
        className={cardClasses}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${cardSize.width}px`,
          height: `${cardSize.height}px`,
          zIndex: zIndex,
          boxShadow: cardShadow,
          transform: isDragging ? 'translateY(-2px)' : 'translateY(0px)',
          touchAction: 'none' // Prevent default touch behaviors
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <div className="p-2 h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                className={`w-full h-full resize-none bg-transparent text-xs font-medium text-center leading-tight border-none outline-none ${colorPalette.text} ${colorPalette.placeholder}`}
                style={{ 
                  minHeight: '100%',
                  fontFamily: 'inherit'
                }}
                placeholder="Type your note..."
              />
            ) : (
              <p className={`text-xs font-medium text-center leading-tight whitespace-pre-wrap ${colorPalette.text}`}>
                {content || 'Double-click to edit'}
              </p>
            )}
          </div>
          
          {/* Character counter - show current/limit format when editing and getting close to limit */}
          {isEditing && remainingChars <= 20 && (
            <div className="text-center mt-1">
              <span className={`text-xs font-medium ${remainingChars <= 10 ? colorPalette.charCounterWarning : colorPalette.charCounterNormal}`}>
                {currentCharCount}/{CHARACTER_LIMIT}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Color Picker - show whenever editing */}
      {isEditing && (
        <div className="color-picker-container">
          <ColorPicker
            x={position.x}
            y={position.y}
            cardWidth={cardSize.width}
            cardHeight={cardSize.height}
            currentColorId={colorId}
            onSelectColor={handleColorChange}
            onDelete={handleDeleteClick}
            onClose={exitEditMode} // Use unified exit function
            scale={scale}
            hasContent={content.trim().length > 0}
          />
        </div>
      )}
    </>
  );
};

export default Card;