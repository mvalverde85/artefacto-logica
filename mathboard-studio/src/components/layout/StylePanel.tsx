import { useBoardStore } from '../../store/boardStore';
import { Trash2, Copy, ArrowUpToLine, ArrowDownToLine, Lock, Unlock } from 'lucide-react';

const STROKE_WIDTHS = [1, 2, 3, 4, 6, 8];
const COLORS = ['#1e293b', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#ffffff', 'transparent'];

export default function StylePanel() {
  const { board, selectedIds, currentStyle, setCurrentStyle, updateElement, removeElements, duplicateElements, bringToFront, sendToBack } = useBoardStore();
  const selectedElements = board.elements.filter((e) => selectedIds.includes(e.id));
  const firstEl = selectedElements[0];

  const update = (patch: Parameters<typeof setCurrentStyle>[0]) => {
    setCurrentStyle(patch);
    selectedIds.forEach((id) => updateElement(id, { style: { ...currentStyle, ...patch } } as any));
  };

  if (selectedIds.length === 0) {
    return (
      <div className="style-panel shrink-0">
        <p className="text-xs text-gray-400 text-center mt-4">Selecciona un objeto para editar sus propiedades</p>
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estilo de trazo</p>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setCurrentStyle({ strokeColor: c })} className={`w-6 h-6 rounded-full border-2 transition-all ${currentStyle.strokeColor === c ? 'border-blue-500 scale-110' : 'border-gray-300'}`} style={{ background: c === 'transparent' ? '#f3f4f6' : c }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="style-panel shrink-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{selectedIds.length > 1 ? `${selectedIds.length} objetos` : 'Propiedades'}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        <button onClick={() => duplicateElements(selectedIds)} className="tool-btn w-7 h-7" title="Duplicar"><Copy size={13} /></button>
        <button onClick={() => removeElements(selectedIds)} className="tool-btn w-7 h-7 hover:text-red-500" title="Eliminar"><Trash2 size={13} /></button>
        <button onClick={() => bringToFront(selectedIds)} className="tool-btn w-7 h-7" title="Traer al frente"><ArrowUpToLine size={13} /></button>
        <button onClick={() => sendToBack(selectedIds)} className="tool-btn w-7 h-7" title="Enviar al fondo"><ArrowDownToLine size={13} /></button>
        {firstEl && <button onClick={() => updateElement(firstEl.id, { locked: !firstEl.locked })} className="tool-btn w-7 h-7" title={firstEl.locked ? 'Desbloquear' : 'Bloquear'}>{firstEl.locked ? <Lock size={13} /> : <Unlock size={13} />}</button>}
      </div>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5">Color de trazo</p>
        <div className="flex flex-wrap gap-1.5">{COLORS.map((c) => <button key={c} onClick={() => update({ strokeColor: c })} className={`w-6 h-6 rounded-full border-2 transition-all ${currentStyle.strokeColor === c ? 'border-blue-500 scale-110' : 'border-gray-200'}`} style={{ background: c === 'transparent' ? '#f3f4f6' : c }} />)}</div>
        <input type="color" value={currentStyle.strokeColor === 'transparent' ? '#000000' : currentStyle.strokeColor} onChange={(e) => update({ strokeColor: e.target.value })} className="mt-1.5 w-full h-7 rounded-lg border border-gray-200 cursor-pointer" />
      </div>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5">Color de relleno</p>
        <div className="flex flex-wrap gap-1.5">{COLORS.map((c) => <button key={c} onClick={() => update({ fillColor: c })} className={`w-6 h-6 rounded-full border-2 transition-all ${currentStyle.fillColor === c ? 'border-blue-500 scale-110' : 'border-gray-200'}`} style={{ background: c === 'transparent' ? '#f3f4f6' : c }} />)}</div>
        <input type="color" value={currentStyle.fillColor === 'transparent' ? '#ffffff' : currentStyle.fillColor} onChange={(e) => update({ fillColor: e.target.value })} className="mt-1.5 w-full h-7 rounded-lg border border-gray-200 cursor-pointer" />
      </div>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5">Grosor de línea</p>
        <div className="flex gap-1.5">{STROKE_WIDTHS.map((w) => <button key={w} onClick={() => update({ strokeWidth: w })} className={`flex-1 h-8 flex items-center justify-center rounded-lg border transition-all text-xs ${currentStyle.strokeWidth === w ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}><div style={{ height: w, width: 20, background: '#374151', borderRadius: w / 2 }} /></button>)}</div>
      </div>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5">Tipo de línea</p>
        <div className="flex gap-1.5">{(['solid', 'dashed', 'dotted'] as const).map((d) => <button key={d} onClick={() => update({ strokeDash: d })} className={`flex-1 h-8 flex items-center justify-center rounded-lg border text-xs transition-all ${currentStyle.strokeDash === d ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}><svg width="28" height="4"><line x1={2} y1={2} x2={26} y2={2} stroke="#374151" strokeWidth={1.5} strokeDasharray={d === 'dashed' ? '6 3' : d === 'dotted' ? '2 3' : undefined} /></svg></button>)}</div>
      </div>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5">Flechas</p>
        <div className="flex gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"><input type="checkbox" checked={currentStyle.startArrow} onChange={(e) => update({ startArrow: e.target.checked })} className="rounded" />Inicio</label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"><input type="checkbox" checked={currentStyle.endArrow} onChange={(e) => update({ endArrow: e.target.checked })} className="rounded" />Fin</label>
        </div>
      </div>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1.5">Opacidad: {Math.round(currentStyle.opacity * 100)}%</p>
        <input type="range" min={0} max={1} step={0.05} value={currentStyle.opacity} onChange={(e) => update({ opacity: Number(e.target.value) })} className="w-full" />
      </div>
      {firstEl && (firstEl.type === 'text' || firstEl.type === 'stickyNote' || firstEl.type === 'formula') && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1.5">Tamaño de texto</p>
          <input type="number" min={8} max={96} value={currentStyle.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })} className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
        </div>
      )}
      {firstEl && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Posición y tamaño</p>
          <div className="grid grid-cols-2 gap-2">
            {[{ label: 'X', value: Math.round(firstEl.x), key: 'x' }, { label: 'Y', value: Math.round(firstEl.y), key: 'y' }, { label: 'W', value: Math.round(firstEl.width), key: 'width' }, { label: 'H', value: Math.round(firstEl.height), key: 'height' }].map(({ label, value, key }) => (
              <label key={key} className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400 w-4">{label}</span>
                <input type="number" value={value} onChange={(e) => updateElement(firstEl.id, { [key]: Number(e.target.value) } as any)} className="flex-1 px-1.5 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400" />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
