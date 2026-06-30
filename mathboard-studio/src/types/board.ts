import type { BoardElement } from './elements';

export type BackgroundType = 'grid' | 'dots' | 'isometric' | 'blank' | 'dark' | 'blackboard';

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Board {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  background: BackgroundType;
  viewport: Viewport;
  elements: BoardElement[];
  settings: BoardSettings;
}

export interface BoardSettings {
  snapToGrid: boolean;
  gridSize: number;
  darkMode: boolean;
}
