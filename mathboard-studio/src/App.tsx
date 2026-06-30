import React, { useEffect, useCallback } from 'react';
import './styles/globals.css';
import TopBar from './components/layout/TopBar';
import ToolBar from './components/layout/ToolBar';
import StylePanel from './components/layout/StylePanel';
import BoardCanvas from './components/board/BoardCanvas';
import { useBoardStore } from './store/boardStore';
import { useToolStore } from './store/toolStore';
import type { ToolType } from './types/tools';

let autoSaveTimer: ReturnType<typeof setTimeout>;

function isEditableTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

const TOOL_SHORTCUTS: Record<string, ToolType> = {
  v: 'pointer',
  h: 'hand',
  e: 'eraser',
  p: 'pen',
  l: 'line',
  t: 'text',
  n: 'stickyNote',
  g: 'formula',
};

export default function App() {
  const { saveStatus, saveToDb, loadFromDb } = useBoardStore();

  useEffect(() => {
    loadFromDb();
  }, []);

  useEffect(() => {
    if (saveStatus === 'unsaved') {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => saveToDb(), 3000);
    }
    return () => clearTimeout(autoSaveTimer);
  }, [saveStatus, saveToDb]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (isEditableTarget(e.target)) return;
    const ctrl = e.metaKey || e.ctrlKey;
    const store = useBoardStore.getState();

    if (ctrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      store.undo();
      return;
    }
    if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      store.redo();
      return;
    }
    if (ctrl && e.key === 's') {
      e.preventDefault();
      store.saveToDb();
      return;
    }
    if (ctrl && e.key === '=') {
      e.preventDefault();
      store.setViewport({ zoom: Math.min(5, store.board.viewport.zoom * 1.2) });
      return;
    }
    if (ctrl && e.key === '-') {
      e.preventDefault();
      store.setViewport({ zoom: Math.max(0.1, store.board.viewport.zoom / 1.2) });
      return;
    }
    if (ctrl && e.key === '0') {
      e.preventDefault();
      store.setViewport({ zoom: 1, x: 0, y: 0 });
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      store.copySelected();
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      store.cutSelected();
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      store.pasteClipboard();
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      store.duplicateElements(store.selectedIds);
      return;
    }
    if (ctrl && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      store.selectAll();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (store.selectedIds.length) {
        e.preventDefault();
        store.deleteSelected();
      }
      return;
    }
    if (e.key === 'Escape') {
      store.clearSelection();
      useToolStore.getState().setTool('pointer');
      return;
    }

    const t = TOOL_SHORTCUTS[e.key.toLowerCase()];
    if (t) {
      e.preventDefault();
      useToolStore.getState().setTool(t);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <div className="flex flex-col" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <ToolBar />
        <BoardCanvas />
        <StylePanel />
      </div>
    </div>
  );
}
