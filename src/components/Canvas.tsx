import React, { useState, useEffect } from 'react';
import Card from './Card';

const Canvas: React.FC = () => {
  const [viewportMode, setViewportMode] = useState<'fixed' | 'scrollable'>('fixed');
  const [canvasScale, setCanvasScale] = useState(1);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [nextCardId, setNextCardId] = useState(2); // Start at 2 since we have card1

  // Minimum canvas dimensions (in pixels)
  const MIN_CANVAS_WIDTH = 800;
  const MIN_CANVAS_HEIGHT = 450; // 16:9 ratio

  // Sample card data - now with editable content and color
  const [cards, setCards] = useState([
    {
      id: 'card1',
      content: 'Sample Card\n(Double-click to edit)',
      x: MIN_CANVAS_WIDTH / 2 - 36,
      y: MIN_CANVAS_HEIGHT / 2 - 36,
      colorId: 'yellow', // Default color
    }
  ]);

  const [cardZIndices, setCardZIndices] = useState<Record<string, number>>({
    'card1': 1
  });

  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const handleCardZIndexChange = (cardId: string) => {
    const newZIndex = nextZIndex + 1;
    setNextZIndex(newZIndex);
    setCardZIndices(prev => ({
      ...prev,
      [cardId]: newZIndex
    }));
  };

  const handleCardContentChange = (cardId: string, newContent: string) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, content: newContent }
          : card
      )
    );
  };

  const handleCardColorChange = (cardId: string, newColorId: string) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, colorId: newColorId }
          : card
      )
    );
  };

  // New function to handle card position updates
  const handleCardPositionChange = (cardId: string, newX: number, newY: number) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, x: newX, y: newY }
          : card
      )
    );
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    // Only create new card if we're double-clicking the canvas itself, not a card
    const target = e.target as HTMLElement;
    
    // Check if the click target is the canvas container or its direct children (quadrant dividers)
    const isCanvasArea = target.classList.contains('canvas-area') || 
                        target.classList.contains('quadrant-divider') ||
                        target.parentElement?.classList.contains('canvas-area');
    
    if (!isCanvasArea) return;

    e.preventDefault();
    e.stopPropagation();

    // Get click position relative to canvas
    const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - canvasRect.left;
    const clickY = e.clientY - canvasRect.top;

    // Convert scaled coordinates back to canvas coordinates
    const actualClickX = clickX / canvasScale;
    const actualClickY = clickY / canvasScale;

    // Create new card at click position
    const newCardId = `card${nextCardId}`;
    const newCard = {
      id: newCardId,
      content: '',
      x: Math.max(0, Math.min(actualClickX - 36, MIN_CANVAS_WIDTH - 72)), // Center card on click, constrain to canvas
      y: Math.max(0, Math.min(actualClickY - 36, MIN_CANVAS_HEIGHT - 72)),
      colorId: 'yellow', // Default color for new cards
    };

    // Add new card
    setCards(prev => [...prev, newCard]);
    
    // Set z-index for new card
    const newZIndex = nextZIndex + 1;
    setNextZIndex(newZIndex);
    setCardZIndices(prev => ({
      ...prev,
      [newCardId]: newZIndex
    }));

    // Set this card as editing
    setEditingCardId(newCardId);
    
    // Increment card counter for next card
    setNextCardId(prev => prev + 1);
  };
  
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Account for padding and header space
      const availableWidth = viewportWidth - 32; // 16px padding on each side
      const availableHeight = viewportHeight - 120; // ~80px for header + padding
      
      // Calculate scale to fit viewport while maintaining 16:9 aspect ratio
      const scaleX = availableWidth / MIN_CANVAS_WIDTH;
      const scaleY = availableHeight / MIN_CANVAS_HEIGHT;
      const optimalScale = Math.min(scaleX, scaleY);
      
      // Switch to scrollable mode when scale would drop below 100%
      if (optimalScale < 1.0) {
        // Switch to scrollable mode and maintain 100% scale
        setViewportMode('scrollable');
        setCanvasScale(1.0);
      } else {
        // Switch to fixed mode with calculated scale (can be > 100%)
        setViewportMode('fixed');
        setCanvasScale(optimalScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderCanvas = (canvasWidth: number, canvasHeight: number) => (
    <div 
      className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 rounded-xl shadow-sm relative overflow-hidden canvas-area"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        transform: `scale(${canvasScale})`,
        transformOrigin: 'center center',
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(148, 163, 184, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(148, 163, 184, 0.03) 0%, transparent 50%)
        `
      }}
      onDoubleClick={handleCanvasDoubleClick}
    >
      {/* Enhanced Quadrant dividers with subtle styling */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="flex-1 border-r-2 border-slate-300/60 quadrant-divider" 
             style={{
               background: 'linear-gradient(to bottom, rgba(148, 163, 184, 0.02) 0%, rgba(148, 163, 184, 0.01) 100%)'
             }}></div>
        <div className="flex-1 quadrant-divider"
             style={{
               background: 'linear-gradient(to bottom, rgba(148, 163, 184, 0.01) 0%, rgba(148, 163, 184, 0.02) 100%)'
             }}></div>
      </div>
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="flex-1 border-b-2 border-slate-300/60 quadrant-divider"
             style={{
               background: 'linear-gradient(to right, rgba(148, 163, 184, 0.02) 0%, rgba(148, 163, 184, 0.01) 100%)'
             }}></div>
        <div className="flex-1 quadrant-divider"
             style={{
               background: 'linear-gradient(to right, rgba(148, 163, 184, 0.01) 0%, rgba(148, 163, 184, 0.02) 100%)'
             }}></div>
      </div>
      
      {/* Cards */}
      {cards.map(card => (
        <Card
          key={card.id}
          id={card.id}
          content={card.content}
          initialX={card.x}
          initialY={card.y}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onZIndexChange={handleCardZIndexChange}
          onContentChange={handleCardContentChange}
          onPositionChange={handleCardPositionChange}
          onColorChange={handleCardColorChange}
          zIndex={cardZIndices[card.id] || 1}
          colorId={card.colorId}
          startInEditMode={editingCardId === card.id}
          onEditModeChange={(isEditing) => {
            if (!isEditing && editingCardId === card.id) {
              setEditingCardId(null);
            }
          }}
          scale={canvasScale}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-100 to-gray-200">
      {/* Enhanced Document Title with subtle depth */}
      <div className="p-6 bg-white/95 backdrop-blur-sm border-b-2 border-slate-200 flex-shrink-0 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Interactive Canvas</h1>
        <p className="text-sm text-slate-600 mt-2 font-medium">
          Drag cards around, double-click to edit and change colors, or double-click empty space to create new cards
        </p>
      </div>
      
      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        {viewportMode === 'fixed' ? (
          // Fixed mode: Canvas scales to fit viewport while maintaining 16:9, centered
          <div className="flex items-center justify-center w-full h-full">
            {renderCanvas(MIN_CANVAS_WIDTH, MIN_CANVAS_HEIGHT)}
          </div>
        ) : (
          // Scrollable mode: Canvas at 100% scale with scrolling
          <div 
            className="overflow-auto w-full h-full border-2 border-slate-300 rounded-xl bg-gradient-to-br from-slate-200 to-gray-300 shadow-inner"
            style={{
              minWidth: '100%',
              minHeight: '100%'
            }}
          >
            {/* Canvas positioned with margin for visual breathing room */}
            <div
              style={{
                margin: '24px', // More generous margin for scrollable mode
                display: 'inline-block' // Prevent margin collapse
              }}
            >
              {renderCanvas(MIN_CANVAS_WIDTH, MIN_CANVAS_HEIGHT)}
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced debug info with better styling */}
      <div className="px-6 py-3 bg-slate-800/95 backdrop-blur-sm text-xs text-slate-300 flex-shrink-0 font-mono border-t border-slate-700">
        <span className="text-slate-400">Mode:</span> <span className="text-white font-semibold">{viewportMode}</span> 
        <span className="mx-3 text-slate-500">|</span> 
        <span className="text-slate-400">Scale:</span> <span className="text-white font-semibold">{Math.round(canvasScale * 100)}%</span> 
        <span className="mx-3 text-slate-500">|</span> 
        <span className="text-slate-400">Canvas:</span> <span className="text-white font-semibold">{MIN_CANVAS_WIDTH}x{MIN_CANVAS_HEIGHT}px</span> 
        <span className="mx-3 text-slate-500">|</span> 
        <span className="text-slate-400">Cards:</span> <span className="text-white font-semibold">{cards.length}</span>
      </div>
    </div>
  );
};

export default Canvas;