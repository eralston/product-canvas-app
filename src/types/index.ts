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

export interface CanvasState {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  cards: Card[];
}

// Re-export from cardColors utility
export type { CardColorPalette } from '../utils/cardColors';