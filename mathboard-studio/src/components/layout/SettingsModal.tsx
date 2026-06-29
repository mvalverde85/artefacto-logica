import { X } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import type { BackgroundType } from '../../types/board';

interface Props { onClose: () => void; }

const BACKGROUNDS: { value: BackgroundType; label: string }[] = [
  { value: 'grid', label: 'Cuadrícula' },
  { value: 'dots', label: 'Puntos' },
  { value: 'isometric', label: 'Isométrica' },
  { value: 'blank', label: 'Papel blanco' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'blackboard', label: 'Pizarra negra' },
];

export default function SettingsModal({ onClose }: Props) {
  const { board, setBackground, setSettings } = useBoardStore();

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Configuración</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Fondo de la pizarra</p>
            <div className="grid grid-cols-3 gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => setBackground(bg.value)}
                  className={`py-2 px-3 rounded-xl text-sm border transition-all ${board.background === bg.value ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Cuadrícula</p>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={board.settings.snapToGrid} onChange={(e) => setSettings({ snapToGrid: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-gray-600">Ajustar a cuadrícula (snap)</span>
              </label>
              <label className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">Tamaño de celda</span>
                <input type="range" min={10} max={50} step={5} value={board.settings.gridSize} onChange={(e) => setSettings({ gridSize: Number(e.target.value) })} className="flex-1" />
                <span className="text-sm text-gray-500 w-8">{board.settings.gridSize}px</span>
              </label>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400"><strong>MathBoard Studio</strong> — Pizarra interactiva matemática<br />Versión 1.0.0 MVP · Hecho con React + TypeScript + Tailwind</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 font-medium">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
