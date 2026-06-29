import React, { useState } from 'react';
import {
  MousePointer2, Hand, Eraser, PenLine, Minus, Triangle,
  Type, StickyNote, FunctionSquare, LineChart, ImagePlus,
  Square, Circle, Hexagon, ChevronDown, GitBranch
} from 'lucide-react';
import { useToolStore } from '../../store/toolStore';
import { useBoardStore, createElement } from '../../store/boardStore';
import type { ToolType } from '../../types/tools';
import type { ShapeKind } from '../../types/elements';

interface ToolBtn { id: ToolType; icon: React.ReactNode; label: string; }

const MAIN_TOOLS: ToolBtn[] = [
  { id: 'pointer', icon: <MousePointer2 size={18} />, label: 'Puntero (V)' },
  { id: 'hand', icon: <Hand size={18} />, label: 'Mano (H)' },
  { id: 'eraser', icon: <Eraser size={18} />, label: 'Borrador (E)' },
  { id: 'pen', icon: <PenLine size={18} />, label: 'Bolígrafo (P)' },
  { id: 'line', icon: <Minus size={18} />, label: 'Línea (L)' },
  { id: 'connector', icon: <GitBranch size={18} />, label: 'Conector' },
  { id: 'text', icon: <Type size={18} />, label: 'Texto (T)' },
  { id: 'stickyNote', icon: <StickyNote size={18} />, label: 'Nota adhesiva (N)' },
  { id: 'formula', icon: <FunctionSquare size={18} />, label: 'Fórmula (G)' },
  { id: 'graph', icon: <LineChart size={18} />, label: 'Gráfico cartesiano' },
  { id: 'image', icon: <ImagePlus size={18} />, label: 'Imagen' },
];

interface ShapeOption { kind: ShapeKind; icon: React.ReactNode; label: string; }
const SHAPES_2D: ShapeOption[] = [
  { kind: 'rect', icon: <Square size={16} />, label: 'Rectángulo' },
  { kind: 'circle', icon: <Circle size={16} />, label: 'Círculo' },
  { kind: 'ellipse', icon: <Circle size={16} />, label: 'Elipse' },
  { kind: 'triangle', icon: <Triangle size={16} />, label: 'Triángulo' },
  { kind: 'diamond', icon: <Square size={16} />, label: 'Rombo' },
  { kind: 'parallelogram', icon: <Square size={16} />, label: 'Paralelogramo' },
  { kind: 'trapezoid', icon: <Square size={16} />, label: 'Trapecio' },
  { kind: 'star', icon: <Hexagon size={16} />, label: 'Estrella' },
];
const SHAPES_3D: ShapeOption[] = [
  { kind: 'cube', icon: <Square size={16} />, label: 'Cubo' },
  { kind: 'cylinder', icon: <Circle size={16} />, label: 'Cilindro' },
  { kind: 'cone', icon: <Triangle size={16} />, label: 'Cono' },
  { kind: 'pyramid', icon: <Triangle size={16} />, label: 'Pirámide' },
  { kind: 'sphere', icon: <Circle size={16} />, label: 'Esfera' },
];

export default function ToolBar() {
  const { tool, shapeKind, setTool, setShapeKind } = useToolStore();
  const { addElement, currentStyle } = useBoardStore();
  const [showShapes, setShowShapes] = useState(false);
  const [shapeTab, setShapeTab] = useState<'2d' | '3d'>('2d');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const map: Record<string, ToolType> = { v: 'pointer', h: 'hand', e: 'eraser', p: 'pen', l: 'line', t: 'text', n: 'stickyNote', g: 'formula' };
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement)?.tagName === 'INPUT' || (ev.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      const t = map[ev.key.toLowerCase()];
      if (t) setTool(t);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTool]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = 400, maxH = 300;
        let w = img.width, h = img.height;
        if (w > maxW) { h = (h * maxW) / w; w = maxW; }
        if (h > maxH) { w = (w * maxH) / h; h = maxH; }
        const el = createElement('image', { x: 100, y: 100, width: w, height: h, src, originalWidth: img.width, originalHeight: img.height } as never, currentStyle);
        addElement(el);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    setTool('pointer');
    e.target.value = '';
  };

  return (
    <div className="toolbar shrink-0 z-10">
      {MAIN_TOOLS.map((t) => {
        if (t.id === 'image') return (
          <React.Fragment key={t.id}>
            <button className={`tool-btn ${tool === t.id ? 'active' : ''}`} title={t.label} onClick={() => fileInputRef.current?.click()}>{t.icon}</button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </React.Fragment>
        );
        return (
          <button key={t.id} className={`tool-btn ${tool === t.id ? 'active' : ''}`} title={t.label} onClick={() => { setTool(t.id); setShowShapes(false); }}>{t.icon}</button>
        );
      })}
      <div className="relative w-full flex justify-center">
        <button className={`tool-btn w-full flex-row gap-0 ${tool === 'shape' ? 'active' : ''}`} title="Formas" onClick={() => setShowShapes(!showShapes)}>
          <Square size={16} /><ChevronDown size={10} />
        </button>
        {showShapes && (
          <div className="absolute left-full ml-2 top-0 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 w-52">
            <div className="flex gap-1 mb-2">
              <button className={`flex-1 text-xs py-1 rounded-lg ${shapeTab === '2d' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setShapeTab('2d')}>2D</button>
              <button className={`flex-1 text-xs py-1 rounded-lg ${shapeTab === '3d' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setShapeTab('3d')}>3D</button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(shapeTab === '2d' ? SHAPES_2D : SHAPES_3D).map((s) => (
                <button key={s.kind} className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 transition-colors ${shapeKind === s.kind && tool === 'shape' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`} title={s.label} onClick={() => { setShapeKind(s.kind); setTool('shape'); setShowShapes(false); }}>
                  {s.icon}
                  <span className="text-[9px] leading-tight text-center">{s.label.slice(0, 6)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
