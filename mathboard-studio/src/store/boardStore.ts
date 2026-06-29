import { create } from 'zustand';
import type { Board, BoardSettings, BackgroundType, Viewport } from '../types/board';
import type { BoardElement, Style } from '../types/elements';
import { saveBoard, loadBoard } from '../utils/indexedDb';

const DEFAULT_STYLE: Style = {
  strokeColor: '#1e293b',
  strokeWidth: 2,
  strokeDash: 'solid',
  fillColor: 'transparent',
  fillOpacity: 1,
  opacity: 1,
  fontSize: 16,
  fontFamily: 'Inter, sans-serif',
  textAlign: 'left',
  bold: false,
  italic: false,
  underline: false,
  startArrow: false,
  endArrow: false,
};

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface HistoryEntry {
  elements: BoardElement[];
}

interface BoardState {
  board: Board;
  selectedIds: string[];
  currentStyle: Style;
  history: HistoryEntry[];
  historyIndex: number;
  saveStatus: 'saved' | 'saving' | 'unsaved';

  setTitle: (title: string) => void;
  setBackground: (bg: BackgroundType) => void;
  setViewport: (vp: Partial<Viewport>) => void;
  setSettings: (s: Partial<BoardSettings>) => void;
  setCurrentStyle: (s: Partial<Style>) => void;

  addElement: (el: BoardElement) => void;
  updateElement: (id: string, updates: Partial<BoardElement>) => void;
  removeElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;

  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;

  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  bringToFront: (ids: string[]) => void;
  sendToBack: (ids: string[]) => void;

  saveToDb: () => Promise<void>;
  loadFromDb: () => Promise<void>;
  exportJson: () => string;
  importJson: (json: string) => void;
}

const INITIAL_BOARD: Board = {
  id: generateId(),
  title: 'Pizarra sin título',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  background: 'grid',
  viewport: { x: 0, y: 0, zoom: 1 },
  elements: [],
  settings: { snapToGrid: false, gridSize: 20, darkMode: false },
};

export const useBoardStore = create<BoardState>((set, get) => ({
  board: INITIAL_BOARD,
  selectedIds: [],
  currentStyle: DEFAULT_STYLE,
  history: [{ elements: [] }],
  historyIndex: 0,
  saveStatus: 'saved',

  setTitle: (title) => set((s) => ({ board: { ...s.board, title } })),
  setBackground: (bg) => set((s) => ({ board: { ...s.board, background: bg } })),
  setViewport: (vp) => set((s) => ({ board: { ...s.board, viewport: { ...s.board.viewport, ...vp } } })),
  setSettings: (settings) => set((s) => ({ board: { ...s.board, settings: { ...s.board.settings, ...settings } } })),
  setCurrentStyle: (style) => set((s) => ({ currentStyle: { ...s.currentStyle, ...style } })),

  addElement: (el) => {
    set((s) => {
      const elements = [...s.board.elements, el];
      return { board: { ...s.board, elements }, saveStatus: 'unsaved' };
    });
    get().pushHistory();
  },

  updateElement: (id, updates) => {
    set((s) => ({
      board: {
        ...s.board,
        elements: s.board.elements.map((e) => (e.id === id ? { ...e, ...updates } as BoardElement : e)),
      },
      saveStatus: 'unsaved',
    }));
  },

  removeElements: (ids) => {
    set((s) => ({
      board: { ...s.board, elements: s.board.elements.filter((e) => !ids.includes(e.id)) },
      selectedIds: s.selectedIds.filter((id) => !ids.includes(id)),
      saveStatus: 'unsaved',
    }));
    get().pushHistory();
  },

  duplicateElements: (ids) => {
    const { board, addElement } = get();
    const toDupe = board.elements.filter((e) => ids.includes(e.id));
    const newIds: string[] = [];
    toDupe.forEach((el) => {
      const newEl = { ...el, id: generateId(), x: el.x + 20, y: el.y + 20, zIndex: board.elements.length + 1 };
      addElement(newEl);
      newIds.push(newEl.id);
    });
    set({ selectedIds: newIds });
  },

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  pushHistory: () => {
    const { board, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: JSON.parse(JSON.stringify(board.elements)) });
    set({ history: newHistory.slice(-50), historyIndex: Math.min(newHistory.length - 1, 49) });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const elements = JSON.parse(JSON.stringify(history[newIndex].elements));
    set((s) => ({ historyIndex: newIndex, board: { ...s.board, elements }, selectedIds: [] }));
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const elements = JSON.parse(JSON.stringify(history[newIndex].elements));
    set((s) => ({ historyIndex: newIndex, board: { ...s.board, elements }, selectedIds: [] }));
  },

  bringToFront: (ids) => {
    set((s) => {
      const maxZ = Math.max(...s.board.elements.map((e) => e.zIndex), 0);
      const elements = s.board.elements.map((e, i) =>
        ids.includes(e.id) ? { ...e, zIndex: maxZ + i + 1 } : e
      );
      return { board: { ...s.board, elements } };
    });
  },

  sendToBack: (ids) => {
    set((s) => {
      const minZ = Math.min(...s.board.elements.map((e) => e.zIndex), 0);
      const elements = s.board.elements.map((e, i) =>
        ids.includes(e.id) ? { ...e, zIndex: minZ - ids.length + i } : e
      );
      return { board: { ...s.board, elements } };
    });
  },

  saveToDb: async () => {
    set({ saveStatus: 'saving' });
    await saveBoard(get().board);
    set({ saveStatus: 'saved' });
  },

  loadFromDb: async () => {
    const board = await loadBoard(get().board.id);
    if (board) {
      set({ board, history: [{ elements: board.elements }], historyIndex: 0 });
    }
  },

  exportJson: () => JSON.stringify(get().board, null, 2),

  importJson: (json) => {
    try {
      const board = JSON.parse(json);
      set({ board, history: [{ elements: board.elements }], historyIndex: 0, selectedIds: [] });
    } catch {
      console.error('Invalid JSON');
    }
  },
}));

export function createElement(
  type: BoardElement['type'],
  partial: Partial<BoardElement>,
  style: Style
): BoardElement {
  const base = {
    id: generateId(),
    type,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: Date.now(),
    locked: false,
    visible: true,
    style: { ...style },
    ...partial,
  };
  return base as BoardElement;
}
