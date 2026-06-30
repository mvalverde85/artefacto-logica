import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';
import type { FunctionDef, GraphElement } from '../../types/elements';

interface Props { id: string; onClose: () => void; }

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
function genId() { return Math.random().toString(36).slice(2); }

export default function GraphEditor({ id, onClose }: Props) {
  const { board, updateElement, pushHistory } = useBoardStore();
  const el = board.elements.find((e) => e.id === id) as GraphElement | undefined;

  const [functions, setFunctions] = useState<FunctionDef[]>(el?.functions ?? [
    { id: genId(), expression: 'sin(x)', color: '#3b82f6', strokeWidth: 2, visible: true },
  ]);
  const [xMin, setXMin] = useState(el?.xMin ?? -5);
  const [xMax, setXMax] = useState(el?.xMax ?? 5);
  const [yMin, setYMin] = useState(el?.yMin ?? -3);
  const [yMax, setYMax] = useState(el?.yMax ?? 3);

  const addFn = () => setFunctions((prev) => [...prev, { id: genId(), expression: 'x', color: COLORS[prev.length % COLORS.length], strokeWidth: 2, visible: true }]);
  const updateFn = (idx: number, patch: Partial<FunctionDef>) => setFunctions((prev) => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));
  const removeFn = (idx: number) => setFunctions((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => { updateElement(id, { functions, xMin, xMax, yMin, yMax } as Partial<GraphElement>); pushHistory(); onClose(); };

  const examples = ['sin(x)', 'cos(x)', 'x^2', '2*x + 1', 'sqrt(x)', 'abs(x)', '1/x', 'log(x)'];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Editor de Gráfico</h2>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Funciones</span>
              <button onClick={addFn} className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Agregar</button>
            </div>
            <div className="flex flex-col gap-2">
              {functions.map((f, idx) => (
                <div key={f.id} className="flex items-center gap-2">
                  <input type="color" value={f.color} onChange={(e) => updateFn(idx, { color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                  <input type="text" value={f.expression} onChange={(e) => updateFn(idx, { expression: e.target.value })} placeholder="ej: sin(x)" className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" />
                  <button onClick={() => updateFn(idx, { visible: !f.visible })} className={`text-xs px-2 py-1 rounded ${f.visible ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>{f.visible ? 'Visible' : 'Oculto'}</button>
                  <button onClick={() => removeFn(idx)} className="text-gray-400 hover:text-red-500 text-sm px-1">×</button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {examples.map((ex) => (
                <button key={ex} onClick={() => setFunctions((prev) => [...prev, { id: genId(), expression: ex, color: COLORS[prev.length % COLORS.length], strokeWidth: 2, visible: true }])} className="text-xs px-2 py-1 bg-gray-100 rounded-lg hover:bg-blue-100 text-gray-600 font-mono">{ex}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Ventana de visualización</span>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'x mín', value: xMin, set: setXMin }, { label: 'x máx', value: xMax, set: setXMax }, { label: 'y mín', value: yMin, set: setYMin }, { label: 'y máx', value: yMax, set: setYMax }].map(({ label, value, set }) => (
                <label key={label} className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">{label}</span>
                  <input type="number" value={value} onChange={(e) => set(Number(e.target.value))} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Aplicar</button>
        </div>
      </div>
    </div>
  );
}
