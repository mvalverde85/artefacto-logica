import { create } from 'zustand';
import type { ToolType } from '../types/tools';
import type { ShapeKind } from '../types/elements';

interface ToolState {
  tool: ToolType;
  shapeKind: ShapeKind;
  setTool: (t: ToolType) => void;
  setShapeKind: (k: ShapeKind) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  tool: 'pointer',
  shapeKind: 'rect',
  setTool: (tool) => set({ tool }),
  setShapeKind: (shapeKind) => set({ shapeKind }),
}));
