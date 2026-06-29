import { useState, useRef } from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut,
  Share2, Settings, Save, Download,
  ChevronDown,
} from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { exportJson, exportPng, exportSvg } from '../../utils/export';
import ShareModal from './ShareModal';
import SettingsModal from './SettingsModal';

export default function TopBar() {
  const {
    board, setTitle,
    undo, redo, history, historyIndex,
    saveToDb, saveStatus, importJson,
    setViewport,
  } = useBoardStore();

  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => { exportJson(board); setShowExport(false); };
  const handleExportPng = () => { const svg = document.querySelector('svg') as SVGSVGElement; if (svg) exportPng(svg, board.title); setShowExport(false); };
  const handleExportSvg = () => { const svg = document.querySelector('svg') as SVGSVGElement; if (svg) exportSvg(svg, board.title); setShowExport(false); };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) importJson(ev.target.result as string); };
    reader.readAsText(file);
  };

  const zoom = board.viewport.zoom;
  const setZoom = (z: number) => setViewport({ zoom: Math.max(0.1, Math.min(5, z)) });

  return (
    <>
      <div className="top-bar shrink-0 z-10 relative">
        <div className="flex items-center gap-2 mr-3">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="font-bold text-gray-800 text-sm hidden sm:block">MathBoard Studio</span>
        </div>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button className="tool-btn" onClick={undo} disabled={historyIndex <= 0} title="Deshacer (Ctrl+Z)"><Undo2 size={16} /></button>
        <button className="tool-btn" onClick={redo} disabled={historyIndex >= history.length - 1} title="Rehacer (Ctrl+Shift+Z)"><Redo2 size={16} /></button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        {editingTitle ? (
          <input
            className="px-2 py-1 text-sm font-medium border border-blue-400 rounded-lg focus:outline-none"
            value={board.title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(false); }}
            autoFocus
          />
        ) : (
          <button className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg max-w-[160px] truncate" onClick={() => setEditingTitle(true)} title="Renombrar pizarra">
            {board.title}
          </button>
        )}
        <div className="flex-1" />
        <button className="tool-btn" onClick={() => setZoom(zoom / 1.2)} title="Alejar"><ZoomOut size={16} /></button>
        <button className="px-2 py-1 text-xs font-mono text-gray-600 hover:bg-gray-100 rounded-lg min-w-[52px] text-center" onClick={() => setZoom(1)} title="Restablecer zoom">{Math.round(zoom * 100)}%</button>
        <button className="tool-btn" onClick={() => setZoom(zoom * 1.2)} title="Acercar"><ZoomIn size={16} /></button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${saveStatus === 'unsaved' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
          onClick={() => saveToDb()}
          title="Guardar"
        >
          <Save size={14} />
          <span className="hidden sm:inline">{saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? 'Guardado' : 'Guardar'}</span>
        </button>
        <div className="relative">
          <button className="tool-btn gap-0.5 flex-row px-2 w-auto" onClick={() => setShowExport(!showExport)} title="Exportar / Importar">
            <Download size={15} /><ChevronDown size={12} />
          </button>
          {showExport && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44 z-50">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700" onClick={handleExportJson}>Exportar JSON</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700" onClick={handleExportPng}>Exportar PNG</button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700" onClick={handleExportSvg}>Exportar SVG</button>
              <div className="border-t border-gray-100 my-1" />
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700" onClick={() => { fileInputRef.current?.click(); setShowExport(false); }}>Importar JSON…</button>
            </div>
          )}
        </div>
        <button className="tool-btn" onClick={() => setShowShare(true)} title="Compartir"><Share2 size={16} /></button>
        <button className="tool-btn" onClick={() => setShowSettings(true)} title="Configuración"><Settings size={16} /></button>
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold ml-1 cursor-pointer">U</div>
      </div>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
