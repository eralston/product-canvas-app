import React, { useState, useEffect } from 'react';
import Card from './Card';
import EditableLabel from './EditableLabel';
import { CanvasLabels } from '../types';
import { LayoutGrid, ChevronLeft, ChevronRight, Undo2, Redo2, Download, Plus, FileText } from 'lucide-react';

const Canvas: React.FC = () => {
  const [viewportMode, setViewportMode] = useState<'fixed' | 'scrollable'>('fixed');
  const [canvasScale, setCanvasScale] = useState(1);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [nextCardId, setNextCardId] = useState(2); // Start at 2 since we have card1

  // Minimum canvas dimensions (in pixels)
  const MIN_CANVAS_WIDTH = 800;
  const MIN_CANVAS_HEIGHT = 450; // 16:9 ratio

  // Canvas labels state with default "Effort vs Impact" values
  const [canvasLabels, setCanvasLabels] = useState<CanvasLabels>({
    documentTitle: 'Effort vs Impact Quadrant',
    xAxisLabel: 'Effort',
    yAxisLabel: 'Impact',
    quadrantLabels: {
      topRight: 'Big Bets',       // High Impact, High Effort
      topLeft: 'Quick Wins',      // High Impact, Low Effort
      bottomRight: 'Money Pit',   // Low Impact, High Effort
      bottomLeft: 'Fill-Ins'      // Low Impact, Low Effort
    }
  });

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

  // Extracted card creation logic
  const createNewCardAtPosition = (x: number, y: number) => {
    const newCardId = `card${nextCardId}`;
    const newCard = {
      id: newCardId,
      content: '',
      x: Math.max(0, Math.min(x - 36, MIN_CANVAS_WIDTH - 72)), // Center card on position, constrain to canvas
      y: Math.max(0, Math.min(y - 36, MIN_CANVAS_HEIGHT - 72)),
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

  // Handler for New Card button
  const handleNewCardButtonClick = () => {
    // Create new card at center of canvas
    const centerX = MIN_CANVAS_WIDTH / 2;
    const centerY = MIN_CANVAS_HEIGHT / 2;
    createNewCardAtPosition(centerX, centerY);
  };

  // Handler for New Page button
  const handleNewPageButtonClick = () => {
    // For now, just show an alert - this will be implemented later
    alert('New Page functionality will be implemented when we add multi-page support!');
  };

  // Label update handlers
  const handleDocumentTitleSave = (newTitle: string) => {
    setCanvasLabels(prev => ({
      ...prev,
      documentTitle: newTitle
    }));
  };

  const handleXAxisLabelSave = (newLabel: string) => {
    setCanvasLabels(prev => ({
      ...prev,
      xAxisLabel: newLabel
    }));
  };

  const handleYAxisLabelSave = (newLabel: string) => {
    setCanvasLabels(prev => ({
      ...prev,
      yAxisLabel: newLabel
    }));
  };

  const handleQuadrantLabelSave = (quadrant: keyof CanvasLabels['quadrantLabels'], newLabel: string) => {
    setCanvasLabels(prev => ({
      ...prev,
      quadrantLabels: {
        ...prev.quadrantLabels,
        [quadrant]: newLabel
      }
    }));
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

    createNewCardAtPosition(actualClickX, actualClickY);
  };
  
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Account for fixed header height (96px) and some padding
      const headerHeight = 96;
      const availableWidth = viewportWidth - 32; // 16px padding on each side
      const availableHeight = viewportHeight - headerHeight - 32; // Header + padding
      
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
      className="relative overflow-hidden canvas-area rounded-lg shadow-sm border border-gray-200"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        transform: `scale(${canvasScale})`,
        transformOrigin: 'center center',
        background: 'linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%)',
      }}
      onDoubleClick={handleCanvasDoubleClick}
    >
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.2) 1px, transparent 0)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Enhanced quadrant dividers with subtle gradients */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="flex-1 relative quadrant-divider">
          <div 
            className="absolute right-0 top-0 h-full w-px"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(75, 85, 99, 0.5) 20%, rgba(75, 85, 99, 0.7) 50%, rgba(75, 85, 99, 0.5) 80%, transparent 100%)'
            }}
          />
        </div>
        <div className="flex-1 quadrant-divider"></div>
      </div>
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="flex-1 relative quadrant-divider">
          <div 
            className="absolute bottom-0 left-0 w-full h-px"
            style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(75, 85, 99, 0.5) 20%, rgba(75, 85, 99, 0.7) 50%, rgba(75, 85, 99, 0.5) 80%, transparent 100%)'
            }}
          />
        </div>
        <div className="flex-1 quadrant-divider"></div>
      </div>

      {/* Y-Axis Label (top of canvas, just to the right of the vertical line) */}
      <div className="absolute top-4 left-1/2 ml-2 pointer-events-auto">
        <EditableLabel
          initialValue={canvasLabels.yAxisLabel}
          onSave={handleYAxisLabelSave}
          characterLimit={20}
          displayClassName="text-sm font-light text-gray-700"
          inputClassName="text-sm"
          iconSize={12}
        />
      </div>

      {/* X-Axis Label (left edge of canvas, just above the horizontal line) */}
      <div className="absolute top-1/2 left-4 -mt-6 pointer-events-auto">
        <EditableLabel
          initialValue={canvasLabels.xAxisLabel}
          onSave={handleXAxisLabelSave}
          characterLimit={20}
          displayClassName="text-sm font-light text-gray-700"
          inputClassName="text-sm"
          iconSize={12}
        />
      </div>

      {/* Quadrant Labels with subtle background overlays */}
      {/* Top-Left Quadrant: Quick Wins (High Impact, Low Effort) */}
      <div 
        className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.08) 0%, rgba(107, 114, 128, 0.05) 100%)'
        }}
      >
        <div className="absolute top-4 left-4 pointer-events-auto">
          <EditableLabel
            initialValue={canvasLabels.quadrantLabels.topLeft}
            onSave={(newLabel) => handleQuadrantLabelSave('topLeft', newLabel)}
            characterLimit={30}
            displayClassName="text-sm font-medium text-gray-700"
            inputClassName="text-sm"
            iconSize={10}
          />
        </div>
      </div>

      {/* Top-Right Quadrant: Big Bets (High Impact, High Effort) */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(225deg, rgba(156, 163, 175, 0.08) 0%, rgba(107, 114, 128, 0.05) 100%)'
        }}
      >
        <div className="absolute top-4 right-4 pointer-events-auto">
          <EditableLabel
            initialValue={canvasLabels.quadrantLabels.topRight}
            onSave={(newLabel) => handleQuadrantLabelSave('topRight', newLabel)}
            characterLimit={30}
            displayClassName="text-sm font-medium text-gray-700"
            inputClassName="text-sm"
            iconSize={10}
          />
        </div>
      </div>

      {/* Bottom-Left Quadrant: Fill-Ins (Low Impact, Low Effort) */}
      <div 
        className="absolute bottom-0 left-0 w-1/2 h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, rgba(156, 163, 175, 0.08) 0%, rgba(107, 114, 128, 0.05) 100%)'
        }}
      >
        <div className="absolute bottom-8 left-4 pointer-events-auto">
          <EditableLabel
            initialValue={canvasLabels.quadrantLabels.bottomLeft}
            onSave={(newLabel) => handleQuadrantLabelSave('bottomLeft', newLabel)}
            characterLimit={30}
            displayClassName="text-sm font-medium text-gray-700"
            inputClassName="text-sm"
            iconSize={10}
          />
        </div>
      </div>

      {/* Bottom-Right Quadrant: Money Pit (Low Impact, High Effort) */}
      <div 
        className="absolute bottom-0 right-0 w-1/2 h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(315deg, rgba(156, 163, 175, 0.08) 0%, rgba(107, 114, 128, 0.05) 100%)'
        }}
      >
        <div className="absolute bottom-8 right-4 pointer-events-auto">
          <EditableLabel
            initialValue={canvasLabels.quadrantLabels.bottomRight}
            onSave={(newLabel) => handleQuadrantLabelSave('bottomRight', newLabel)}
            characterLimit={30}
            displayClassName="text-sm font-medium text-gray-700"
            inputClassName="text-sm"
            iconSize={10}
          />
        </div>
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
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* New Header with App Identity, Document Context, and Page Actions */}
      <div className="fixed top-0 left-0 right-0 z-30 h-24 bg-white border-b shadow-sm flex items-center justify-between px-6">
        {/* Left Section: App Identity */}
        <div className="flex items-center gap-3">
          <LayoutGrid size={28} className="text-blue-600" />
          <span className="font-open-sans font-extrabold text-3xl text-gray-800 tracking-tight">
            Quadrant
          </span>
        </div>

        {/* Middle Section: Document Context */}
        <div className="flex items-center gap-6">
          {/* Document Title */}
          <EditableLabel
            initialValue={canvasLabels.documentTitle}
            onSave={handleDocumentTitleSave}
            characterLimit={60}
            displayClassName="text-lg font-semibold text-gray-800"
            inputClassName="text-lg font-semibold"
          />
          
          {/* Page Navigation */}
          <div className="flex items-center gap-2 text-gray-600">
            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium px-2">Page 1 of 3</span>
            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* New Page Button - Secondary style with icon and text */}
          <button 
            onClick={handleNewPageButtonClick}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
          >
            <FileText size={16} />
            New Page
          </button>

          {/* Document Actions */}
          <div className="flex items-center gap-1">
            <button 
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="Undo"
            >
              <Undo2 size={16} className="text-gray-600" />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="Redo"
            >
              <Redo2 size={16} className="text-gray-600" />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="Export"
            >
              <Download size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Right Section: Page Actions */}
        <div className="flex items-center gap-3">
          {/* New Card Button - Primary style */}
          <button 
            onClick={handleNewCardButtonClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={16} />
            New Card
          </button>
        </div>
      </div>
      
      {/* Canvas Container - with top padding to account for fixed header */}
      <div className="pt-24"> {/* Padding to account for fixed header */}
        {viewportMode === 'fixed' ? (
          // Fixed mode: Canvas scales to fit viewport while maintaining 16:9, centered
          <div className="h-screen flex items-center justify-center p-4" style={{ height: 'calc(100vh - 6rem)' }}>
            <div className="flex items-center justify-center w-full h-full">
              {renderCanvas(MIN_CANVAS_WIDTH, MIN_CANVAS_HEIGHT)}
            </div>
          </div>
        ) : (
          // Scrollable mode: Canvas at 100% scale with scrolling, using full available space
          <div 
            className="overflow-auto bg-gray-100"
            style={{
              height: 'calc(100vh - 6rem)', // Full viewport minus header
              minWidth: '100%'
            }}
          >
            {/* Canvas positioned with margin for visual breathing room */}
            <div
              style={{
                margin: '16px', // Comfortable margin for scrollable mode
                display: 'inline-block' // Prevent margin collapse
              }}
            >
              {renderCanvas(MIN_CANVAS_WIDTH, MIN_CANVAS_HEIGHT)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;