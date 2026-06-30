import React from 'react';
import type { BoardElement } from '../../types/elements';

interface Props {
  elements: BoardElement[];
  zoom: number;
  vpX: number;
  vpY: number;
  onResizeStart?: (handle: string, e: React.PointerEvent) => void;
  onRotateStart?: (e: React.PointerEvent) => void;
}

export default function SelectionBox({ elements, zoom, vpX, vpY, onResizeStart, onRotateStart }: Props) {
  if (elements.length === 0) return null;

  const xs = elements.flatMap((e) => [e.x, e.x + e.width]);
  const ys = elements.flatMap((e) => [e.y, e.y + e.height]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const w = Math.max(...xs) - x;
  const h = Math.max(...ys) - y;

  const sx = x * zoom + vpX;
  const sy = y * zoom + vpY;
  const sw = w * zoom;
  const sh = h * zoom;

  const HANDLE_SIZE = 8;
  const handles = [
    { id: 'nw', cx: sx, cy: sy, cursor: 'nw-resize' },
    { id: 'n', cx: sx + sw / 2, cy: sy, cursor: 'n-resize' },
    { id: 'ne', cx: sx + sw, cy: sy, cursor: 'ne-resize' },
    { id: 'e', cx: sx + sw, cy: sy + sh / 2, cursor: 'e-resize' },
    { id: 'se', cx: sx + sw, cy: sy + sh, cursor: 'se-resize' },
    { id: 's', cx: sx + sw / 2, cy: sy + sh, cursor: 's-resize' },
    { id: 'sw', cx: sx, cy: sy + sh, cursor: 'sw-resize' },
    { id: 'w', cx: sx, cy: sy + sh / 2, cursor: 'w-resize' },
  ];

  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={sx} y={sy} width={sw} height={sh} fill="rgba(59,130,246,0.05)" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 3" style={{ pointerEvents: 'none' }} />
      {handles.map((h) => (
        <rect
          key={h.id}
          x={h.cx - HANDLE_SIZE / 2}
          y={h.cy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={1.5}
          style={{ cursor: h.cursor, pointerEvents: 'all' }}
          onPointerDown={(e) => { e.stopPropagation(); onResizeStart?.(h.id, e); }}
        />
      ))}
      <circle cx={sx + sw / 2} cy={sy - 20} r={5} fill="white" stroke="#3b82f6" strokeWidth={1.5} style={{ cursor: 'grab', pointerEvents: 'all' }} onPointerDown={(e) => { e.stopPropagation(); onRotateStart?.(e); }} />
      <line x1={sx + sw / 2} y1={sy - 15} x2={sx + sw / 2} y2={sy} stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 2" />
    </g>
  );
}
