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
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  x,
  y,
  cardWidth,
  cardHeight,
  currentColorId,
  onSelectColor,
  onClose,
  scale
}) => {
  // Calculate position to appear to the right of the card, or left if not enough space
  const pickerWidth = 200;
  const pickerHeight = 60;
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
    onClose();
  };

  return (
    <>
      {/* Backdrop to close picker when clicking outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Color picker popup */}
      <div
        className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
        style={{
          left: `${pickerX}px`,
          top: `${pickerY}px`,
          width: `${pickerWidth}px`,
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs font-medium text-gray-700 mb-2">Choose color:</div>
        <div className="flex flex-wrap gap-2">
          {cardColorPalettes.map((palette) => (
            <button
              key={palette.id}
              className={`
                w-8 h-8 rounded-full border-2 transition-all duration-150 hover:scale-110
                ${palette.background.replace('bg-', 'bg-')}
                ${currentColorId === palette.id 
                  ? 'border-gray-800 ring-2 ring-gray-400' 
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