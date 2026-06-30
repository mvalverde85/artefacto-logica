import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';

interface Props { id: string; onClose: () => void; }

const FORMULA_SYMBOLS = [
  { cat: 'Básico', symbols: ['+', '-', '×', '÷', '=', '≠', '<', '>', '≤', '≥', '±', '∞'] },
  { cat: 'Letras griegas', symbols: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'φ', 'ω', 'Σ', 'Δ', 'Ω'] },
  { cat: 'Fracciones', symbols: ['\\frac{a}{b}', '\\frac{1}{2}', '\\frac{d}{dx}'] },
  { cat: 'Potencias', symbols: ['x^2', 'x^n', 'x^{-1}', 'e^x'] },
  { cat: 'Raíces', symbols: ['\\sqrt{x}', '\\sqrt[3]{x}', '\\sqrt[n]{x}'] },
  { cat: 'Funciones', symbols: ['\\sin', '\\cos', '\\tan', '\\log', '\\ln', '\\lim_{x \\to 0}'] },
  { cat: 'Integrales', symbols: ['\\int', '\\int_a^b', '\\oint', '\\iint'] },
  { cat: 'Sumatorias', symbols: ['\\sum_{i=1}^n', '\\prod_{i=1}^n'] },
  { cat: 'Conjuntos', symbols: ['∈', '∉', '⊂', '⊆', '∪', '∩', '∅', 'ℝ', 'ℤ', 'ℕ', 'ℚ'] },
  { cat: 'Vectores', symbols: ['\\vec{v}', '\\vec{AB}', '|\\vec{v}|', '\\cdot', '\\times'] },
];

function renderLatexPreview(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, '$1√($2)')
    .replace(/\\int_([^_]+)\^([^\s]+)/g, '∫[$1,$2]')
    .replace(/\\int/g, '∫')
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, 'Σ[$1,$2]')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\prod/g, 'Π')
    .replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos').replace(/\\tan/g, 'tan')
    .replace(/\\log/g, 'log').replace(/\\ln/g, 'ln')
    .replace(/\\lim_\{([^}]+)\}/g, 'lim($1)')
    .replace(/\\vec\{([^}]+)\}/g, 'vec($1)')
    .replace(/\\infty/g, '∞').replace(/\\alpha/g, 'α').replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ').replace(/\\delta/g, 'δ').replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ').replace(/\\theta/g, 'θ').replace(/\\lambda/g, 'λ')
    .replace(/\\omega/g, 'ω')
    .replace(/\^([^{])/g, '^$1')
    .replace(/\^\{([^}]+)\}/g, '^($1)')
    .replace(/_([^{])/g, '_$1')
    .replace(/_\{([^}]+)\}/g, '_($1)');
}

export default function FormulaEditor({ id, onClose }: Props) {
  const { board, updateElement, pushHistory } = useBoardStore();
  const el = board.elements.find((e) => e.id === id) as any;
  const [latex, setLatex] = useState(el?.latex ?? '');
  const [activeCategory, setActiveCategory] = useState('Básico');

  const handleSave = () => {
    updateElement(id, { latex, renderedSvg: `<span style="font-family:serif;font-size:18px;color:#1e293b">${renderLatexPreview(latex)}</span>` });
    pushHistory();
    onClose();
  };

  const insertSymbol = (sym: string) => setLatex((prev: string) => prev + sym);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onPointerDown={(e) => { if (e.target === e.currentTarget) handleSave(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-[640px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Editor de Fórmulas</h2>
          <button onClick={handleSave} className="text-sm text-blue-600 font-medium hover:text-blue-800">Guardar</button>
        </div>
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {FORMULA_SYMBOLS.map((cat) => (
            <button key={cat.cat} onClick={() => setActiveCategory(cat.cat)} className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${activeCategory === cat.cat ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {cat.cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-100 min-h-[52px]">
          {FORMULA_SYMBOLS.find((c) => c.cat === activeCategory)?.symbols.map((sym, i) => (
            <button key={i} onClick={() => insertSymbol(sym)} className="px-2.5 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-mono" title={sym}>
              {sym.length > 6 ? sym.slice(0, 6) + '…' : sym}
            </button>
          ))}
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-600">LaTeX</label>
          <textarea
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:border-blue-400 resize-none"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            placeholder="Escribe LaTeX... ej: \\frac{a}{b} + \\sqrt{x}"
            autoFocus
          />
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[56px] flex items-center justify-center">
            <span className="text-xl font-serif text-gray-800">
              {renderLatexPreview(latex) || <span className="text-gray-400 text-sm font-sans">Vista previa</span>}
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Insertar en pizarra</button>
        </div>
      </div>
    </div>
  );
}
