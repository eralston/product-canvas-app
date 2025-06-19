import React from 'react';
import { cardColorPalettes, CardColorPalette } from '../utils/cardColors';

interface ColorPickerProps {
  x: number;
  y: number;
  cardWidth: number;
  cardHeight: number;
  currentColorId: string;
  onSelectColor: (colorId: string) => void;
  onClose: () => void;
  scale: number;
  hasContent: boolean; // New prop to determine behavior
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  x,
  y,
  cardWidth,
  cardHeight,
  currentColorId,
  onSelectColor,
  onClose,
  scale,
  hasContent
}) => {
  // Calculate position to appear to the right of the card, or left if not enough space
  const pickerWidth = 32; // Much smaller width for vertical layout
  const pickerHeight = cardColorPalettes.length * 20 + 16; // Height based on number of colors
  const spacing = 8;
  
  // Position to the right of the card by default
  let pickerX = x + cardWidth + spacing;
  let pickerY = y;
  
  // If picker would go off-screen to the right, position it to the left
  const canvasWidth = 800; // MIN_CANVAS_WIDTH from Canvas component
  if (pickerX + pickerWidth > canvasWidth) {
    pickerX = x - pickerWidth - spacing;
  }
  
  // Ensure picker doesn't go off-screen vertically
  const canvasHeight = 450; // MIN_CANVAS_HEIGHT from Canvas component
  if (pickerY + pickerHeight > canvasHeight) {
    pickerY = canvasHeight - pickerHeight;
  }
  if (pickerY < 0) {
    pickerY = 0;
  }

  const handleColorSelect = (colorId: string) => {
    onSelectColor(colorId);
    // Only close if the card has content
    if (hasContent) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop to close picker when clicking outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Color picker popup - vertical layout */}
      <div
        className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2"
        style={{
          left: `${pickerX}px`,
          top: `${pickerY}px`,
          width: `${pickerWidth}px`,
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          {cardColorPalettes.map((palette) => (
            <button
              key={palette.id}
              className={`
                w-4 h-4 rounded-full border transition-all duration-150 hover:scale-110
                ${palette.background.replace('bg-', 'bg-')}
                ${currentColorId === palette.id 
                  ? 'border-gray-800 ring-1 ring-gray-400' 
                  : 'border-gray-300 hover:border-gray-500'
                }
              `}
              onClick={() => handleColorSelect(palette.id)}
              title={palette.name}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ColorPicker;