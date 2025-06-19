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
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const CHARACTER_LIMIT = 140;
  const MIN_CARD_WIDTH = 72;
  const MIN_CARD_HEIGHT = 72;
  const MAX_CARD_WIDTH = 164;
  const MAX_CARD_HEIGHT = 124;

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

  // Unified function to exit edit mode and always save content
  const exitEditMode = () => {
    // Always save the current edit content
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
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cardRef.current || isEditing) return;

      const canvas = cardRef.current.parentElement;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      
      // Account for canvas scaling when calculating new position
      const newX = (e.clientX - canvasRect.left) / scale - dragOffset.x;
      const newY = (e.clientY - canvasRect.top) / scale - dragOffset.y;

      const constrainedX = Math.max(0, Math.min(newX, canvasWidth - cardSize.width));
      const constrainedY = Math.max(0, Math.min(newY, canvasHeight - cardSize.height));

      const newPosition = { x: constrainedX, y: constrainedY };
      setPosition(newPosition);
      
      // Update the parent component with the new position
      onPositionChange(id, constrainedX, constrainedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging && !isEditing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, canvasWidth, canvasHeight, isEditing, cardSize, scale, id, onPositionChange]);

  const currentCharCount = editContent.length;
  const remainingChars = CHARACTER_LIMIT - currentCharCount;

  // Build dynamic CSS classes based on color palette with enhanced borders
  const cardClasses = `
    absolute rounded-lg select-none transition-all duration-200 ease-out border-3
    ${colorPalette.background}
    ${isEditing 
      ? `${colorPalette.editingBorder} cursor-text` 
      : isDragging 
        ? `${colorPalette.draggingBorder} cursor-move` 
        : `${colorPalette.border} ${colorPalette.hoverBorder} cursor-move`
    }
  `;

  // Enhanced shadows for more pronounced depth
  const cardShadow = isEditing
    ? '0 0 0 3px rgba(59, 130, 246, 0.4), 0 12px 32px -8px rgba(0, 0, 0, 0.2)'
    : isDragging 
      ? `0 32px 64px -16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 12px 24px -6px ${colorPalette.shadowSecondary}`
      : `0 6px 12px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px 0 ${colorPalette.shadowPrimary}`;

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
          transform: isDragging ? 'translateY(-3px)' : 'translateY(0px)'
        }}
        onMouseDown={handleMouseDown}
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
                className={`w-full h-full resize-none bg-transparent text-xs font-semibold text-center leading-tight border-none outline-none ${colorPalette.text} ${colorPalette.placeholder}`}
                style={{ 
                  minHeight: '100%',
                  fontFamily: 'inherit'
                }}
                placeholder="Type your note..."
              />
            ) : (
              <p className={`text-xs font-semibold text-center leading-tight whitespace-pre-wrap ${colorPalette.text}`}>
                {content || 'Double-click to edit'}
              </p>
            )}
          </div>
          
          {/* Character counter - show current/limit format when editing and getting close to limit */}
          {isEditing && remainingChars <= 20 && (
            <div className="text-center mt-1">
              <span className={`text-xs font-bold ${remainingChars <= 10 ? colorPalette.charCounterWarning : colorPalette.charCounterNormal}`}>
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