import React, { useEffect, useCallback } from 'react';
import './styles/globals.css';
import TopBar from './components/layout/TopBar';
import ToolBar from './components/layout/ToolBar';
import StylePanel from './components/layout/StylePanel';
import BoardCanvas from './components/board/BoardCanvas';
import { useBoardStore } from './store/boardStore';

let autoSaveTimer: ReturnType<typeof setTimeout>;

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
    const ctrl = e.metaKey || e.ctrlKey;
    if (ctrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      useBoardStore.getState().undo();
    }
    if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      useBoardStore.getState().redo();
    }
    if (ctrl && e.key === 's') {
      e.preventDefault();
      useBoardStore.getState().saveToDb();
    }
    if (ctrl && e.key === '=') {
      e.preventDefault();
      const { board, setViewport } = useBoardStore.getState();
      setViewport({ zoom: Math.min(5, board.viewport.zoom * 1.2) });
    }
    if (ctrl && e.key === '-') {
      e.preventDefault();
      const { board, setViewport } = useBoardStore.getState();
      setViewport({ zoom: Math.max(0.1, board.viewport.zoom / 1.2) });
    }
    if (ctrl && e.key === '0') {
      e.preventDefault();
      useBoardStore.getState().setViewport({ zoom: 1, x: 0, y: 0 });
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
