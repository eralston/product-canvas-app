export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Card {
  id: string;
  content: string;
  position: Position;
  color: string;
  createdAt: Date;
  createdBy: string;
}

export interface CanvasLabels {
  documentTitle: string;
  xAxisLabel: string;
  yAxisLabel: string;
  quadrantLabels: {
    topRight: string;    // High Impact, High Ease - Quick Wins
    topLeft: string;     // High Impact, Low Ease - Big Bets
    bottomRight: string; // Low Impact, High Ease - Fill-Ins
    bottomLeft: string;  // Low Impact, Low Ease - Money Pit
  };
}

export interface CanvasState {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  cards: Card[];
}

// Re-export from cardColors utility
export type { CardColorPalette } from '../utils/cardColors';