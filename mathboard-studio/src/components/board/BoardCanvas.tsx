import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useBoardStore, createElement } from '../../store/boardStore';
import { useToolStore } from '../../store/toolStore';
import { screenToCanvas, snapToGrid, pointInRect, rectsOverlap, getBoundingBox } from '../../utils/geometry';
import GridLayer from './GridLayer';
import ElementRenderer from './ElementRenderer';
import SelectionBox from './SelectionBox';
import type { BoardElement, StrokeElement, ShapeElement, LineElement, StickyNoteElement, TextElement, FormulaElement, GraphElement } from '../../types/elements';
import TextEditor from '../tools/TextEditor';
import FormulaEditor from '../math/FormulaEditor';
import GraphEditor from '../math/GraphEditor';

const STICKY_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa'];
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

export default function BoardCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { board, selectedIds, currentStyle, addElement, updateElement, removeElements, duplicateElements, setSelectedIds, clearSelection, setViewport, pushHistory } = useBoardStore();
  const { tool, shapeKind } = useToolStore();
  const { viewport, elements, settings } = board;
  const { x: vpX, y: vpY, zoom } = viewport;

  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const drawState = useRef<{ drawing: boolean; tempId: string | null; startX: number; startY: number; points: [number, number][]; polylineActive: boolean; }>({ drawing: false, tempId: null, startX: 0, startY: 0, points: [], polylineActive: false });
  const panState = useRef<{ panning: boolean; lastX: number; lastY: number }>({ panning: false, lastX: 0, lastY: 0 });
  const spaceDown = useRef(false);
  const moveState = useRef<{ moving: boolean; lastX: number; lastY: number; origPositions: Record<string, { x: number; y: number }> }>({ moving: false, lastX: 0, lastY: 0, origPositions: {} });

  const [editingText, setEditingText] = useState<{ id: string; x: number; y: number; w: number; h: number } | null>(null);
  const [editingFormula, setEditingFormula] = useState<{ id: string } | null>(null);
  const [editingGraph, setEditingGraph] = useState<{ id: string } | null>(null);

  const lastPinchDist = useRef<number | null>(null);

  useEffect(() => {
    const obs = new ResizeObserver(() => { if (containerRef.current) setSize({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight }); });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = true;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length && document.activeElement === document.body) { e.preventDefault(); removeElements(selectedIds); }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); if (selectedIds.length) duplicateElements(selectedIds); }
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') spaceDown.current = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [selectedIds, removeElements, duplicateElements]);

  const toCanvas = useCallback((sx: number, sy: number): [number, number] => screenToCanvas(sx, sy, vpX, vpY, zoom), [vpX, vpY, zoom]);
  const snap = useCallback((v: number) => snapToGrid(v, settings.gridSize, settings.snapToGrid), [settings]);

  const getElementAt = useCallback((cx: number, cy: number): BoardElement | null => {
    const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    for (const el of sorted) if (pointInRect(cx, cy, el.x - 8, el.y - 8, el.width + 16, el.height + 16)) return el;
    return null;
  }, [elements]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const rect = svgRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * delta));
      setViewport({ x: mx - (mx - vpX) * (newZoom / zoom), y: my - (my - vpY) * (newZoom / zoom), zoom: newZoom });
    } else {
      setViewport({ x: vpX - e.deltaX, y: vpY - e.deltaY });
    }
  }, [zoom, vpX, vpY, setViewport]);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button === 1 || spaceDown.current || tool === 'hand') {
      panState.current = { panning: true, lastX: e.clientX, lastY: e.clientY };
      (e.target as Element).setPointerCapture(e.pointerId);
      return;
    }
    const [cx, cy] = toCanvas(e.clientX, e.clientY);
    const sx = snap(cx), sy = snap(cy);

    if (tool === 'eraser') { const el = getElementAt(cx, cy); if (el) removeElements([el.id]); return; }

    if (tool === 'pointer') {
      const el = getElementAt(cx, cy);
      if (el) {
        if (!selectedIds.includes(el.id)) setSelectedIds(e.shiftKey ? [...selectedIds, el.id] : [el.id]);
        const ids = e.shiftKey ? [...selectedIds, el.id] : [el.id];
        const origPositions: Record<string, { x: number; y: number }> = {};
        ids.forEach((id) => { const found = elements.find((el2) => el2.id === id); if (found) origPositions[id] = { x: found.x, y: found.y }; });
        moveState.current = { moving: true, lastX: cx, lastY: cy, origPositions };
        (e.target as Element).setPointerCapture(e.pointerId);
      } else {
        clearSelection();
        drawState.current = { ...drawState.current, drawing: true, startX: cx, startY: cy, points: [] };
        (e.target as Element).setPointerCapture(e.pointerId);
      }
      return;
    }

    if (tool === 'pen') {
      const newEl = createElement('stroke', { x: sx, y: sy, width: 0, height: 0, points: [[sx, sy]], smoothed: true } as Partial<StrokeElement>, currentStyle) as StrokeElement;
      addElement(newEl);
      drawState.current = { drawing: true, tempId: newEl.id, startX: sx, startY: sy, points: [[sx, sy]], polylineActive: false };
      (e.target as Element).setPointerCapture(e.pointerId);
      return;
    }
    if (tool === 'line') {
      const newEl = createElement('line', { x: sx, y: sy, width: 0, height: 0, x1: sx, y1: sy, x2: sx, y2: sy } as Partial<LineElement>, currentStyle);
      addElement(newEl);
      drawState.current = { drawing: true, tempId: newEl.id, startX: sx, startY: sy, points: [], polylineActive: false };
      (e.target as Element).setPointerCapture(e.pointerId);
      return;
    }
    if (tool === 'shape') {
      const newEl = createElement('shape', { x: sx, y: sy, width: 2, height: 2, kind: shapeKind } as Partial<ShapeElement>, currentStyle);
      addElement(newEl);
      drawState.current = { drawing: true, tempId: newEl.id, startX: sx, startY: sy, points: [], polylineActive: false };
      (e.target as Element).setPointerCapture(e.pointerId);
      return;
    }
    if (tool === 'connector') {
      const newEl = createElement('connector', { x: sx, y: sy, width: 0, height: 0, fromX: sx, fromY: sy, toX: sx, toY: sy, connectorType: 'straight' } as any, { ...currentStyle, endArrow: true });
      addElement(newEl);
      drawState.current = { drawing: true, tempId: newEl.id, startX: sx, startY: sy, points: [], polylineActive: false };
      (e.target as Element).setPointerCapture(e.pointerId);
      return;
    }
    if (tool === 'text') {
      const newEl = createElement('text', { x: sx, y: sy, width: 200, height: 40, text: 'Texto' } as Partial<TextElement>, currentStyle);
      addElement(newEl);
      setSelectedIds([newEl.id]);
      setEditingText({ id: newEl.id, x: newEl.x * zoom + vpX, y: newEl.y * zoom + vpY, w: 200 * zoom, h: 40 * zoom });
      return;
    }
    if (tool === 'stickyNote') {
      const color = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
      const newEl = createElement('stickyNote', { x: sx, y: sy, width: 160, height: 120, text: 'Nota...', color } as Partial<StickyNoteElement>, currentStyle);
      addElement(newEl); setSelectedIds([newEl.id]);
      return;
    }
    if (tool === 'formula') {
      const newEl = createElement('formula', { x: sx, y: sy, width: 200, height: 60, latex: 'x^2 + y^2 = r^2' } as Partial<FormulaElement>, currentStyle);
      addElement(newEl); setSelectedIds([newEl.id]); setEditingFormula({ id: newEl.id });
      return;
    }
    if (tool === 'graph') {
      const newEl = createElement('graph', { x: sx, y: sy, width: 300, height: 220, functions: [{ id: '1', expression: 'sin(x)', color: '#3b82f6', strokeWidth: 2, visible: true }], xMin: -5, xMax: 5, yMin: -3, yMax: 3, showGrid: true, showAxes: true } as Partial<GraphElement>, currentStyle);
      addElement(newEl); setSelectedIds([newEl.id]); setEditingGraph({ id: newEl.id });
      return;
    }
  }, [tool, shapeKind, toCanvas, snap, getElementAt, selectedIds, elements, addElement, removeElements, setSelectedIds, clearSelection, currentStyle, vpX, vpY, zoom]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (panState.current.panning) {
      setViewport({ x: vpX + e.clientX - panState.current.lastX, y: vpY + e.clientY - panState.current.lastY });
      panState.current.lastX = e.clientX; panState.current.lastY = e.clientY;
      return;
    }
    if (moveState.current.moving) {
      const [cx, cy] = toCanvas(e.clientX, e.clientY);
      const dx = cx - moveState.current.lastX, dy = cy - moveState.current.lastY;
      moveState.current.lastX = cx; moveState.current.lastY = cy;
      Object.keys(moveState.current.origPositions).forEach((id) => { const el = elements.find((el2) => el2.id === id); if (el) updateElement(id, { x: snap(el.x + dx), y: snap(el.y + dy) }); });
      return;
    }
    if (!drawState.current.drawing) return;
    const [cx, cy] = toCanvas(e.clientX, e.clientY);
    const sx = snap(cx), sy = snap(cy);
    const { startX, startY, tempId } = drawState.current;

    if (tool === 'pen' && tempId) {
      const pts: [number, number][] = [...drawState.current.points, [sx, sy]];
      drawState.current.points = pts;
      const bb = getBoundingBox(pts);
      updateElement(tempId, { points: pts, x: bb.x, y: bb.y, width: bb.width, height: bb.height } as any);
      return;
    }
    if (tool === 'line' && tempId) {
      const x = Math.min(startX, sx), y = Math.min(startY, sy);
      updateElement(tempId, { x1: startX, y1: startY, x2: sx, y2: sy, x, y, width: Math.abs(sx - startX), height: Math.abs(sy - startY) } as any);
      return;
    }
    if (tool === 'shape' && tempId) {
      updateElement(tempId, { x: Math.min(startX, sx), y: Math.min(startY, sy), width: Math.abs(sx - startX) || 2, height: Math.abs(sy - startY) || 2 });
      return;
    }
    if (tool === 'connector' && tempId) {
      updateElement(tempId, { toX: sx, toY: sy, x: Math.min(startX, sx), y: Math.min(startY, sy), width: Math.abs(sx - startX), height: Math.abs(sy - startY) } as any);
      return;
    }
    if (tool === 'pointer' && drawState.current.drawing) {
      const x = Math.min(startX, cx), y = Math.min(startY, cy);
      setSelectionRect({ x, y, w: Math.abs(cx - startX), h: Math.abs(cy - startY) });
      setSelectedIds(elements.filter((el) => rectsOverlap(x, y, Math.abs(cx - startX), Math.abs(cy - startY), el.x, el.y, el.width, el.height)).map((el) => el.id));
    }
  }, [tool, vpX, vpY, elements, updateElement, setViewport, toCanvas, snap, setSelectedIds]);

  const onPointerUp = useCallback((_e: React.PointerEvent<SVGSVGElement>) => {
    if (panState.current.panning) { panState.current.panning = false; return; }
    if (moveState.current.moving) { moveState.current.moving = false; pushHistory(); return; }
    if (drawState.current.drawing) {
      if (tool !== 'polyline') {
        drawState.current.drawing = false;
        if (drawState.current.tempId) { setSelectedIds([drawState.current.tempId]); drawState.current.tempId = null; pushHistory(); }
      }
      setSelectionRect(null);
    }
  }, [tool, pushHistory, setSelectedIds]);

  const handleDblClick = useCallback((id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    if (el.type === 'text' || el.type === 'stickyNote') setEditingText({ id, x: el.x * zoom + vpX, y: el.y * zoom + vpY, w: el.width * zoom, h: el.height * zoom });
    else if (el.type === 'formula') setEditingFormula({ id });
    else if (el.type === 'graph') setEditingGraph({ id });
  }, [elements, zoom, vpX, vpY]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / lastPinchDist.current;
      lastPinchDist.current = dist;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2, cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = svgRef.current!.getBoundingClientRect();
      const mx = cx - rect.left, my = cy - rect.top;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * scale));
      setViewport({ x: mx - (mx - vpX) * (newZoom / zoom), y: my - (my - vpY) * (newZoom / zoom), zoom: newZoom });
    }
  }, [zoom, vpX, vpY, setViewport]);

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const selectedElements = elements.filter((e) => selectedIds.includes(e.id));

  const getCursor = () => {
    if (spaceDown.current || tool === 'hand') return 'grab';
    if (panState.current.panning) return 'grabbing';
    if (tool === 'pen') return 'crosshair';
    if (tool === 'eraser') return 'cell';
    if (tool === 'pointer') return 'default';
    return 'crosshair';
  };

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden canvas-container" style={{ background: '#f8fafc' }}>
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        style={{ cursor: getCursor(), display: 'block', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => { lastPinchDist.current = null; }}
      >
        <GridLayer width={size.w} height={size.h} vpX={vpX} vpY={vpY} zoom={zoom} background={board.background} gridSize={settings.gridSize} />
        <g>
          {sortedElements.map((el) => (
            <ElementRenderer key={el.id} element={el} selected={selectedIds.includes(el.id)} onDoubleClick={handleDblClick} />
          ))}
        </g>
        {selectionRect && (
          <rect x={selectionRect.x * zoom + vpX} y={selectionRect.y * zoom + vpY} width={selectionRect.w * zoom} height={selectionRect.h * zoom} fill="rgba(59,130,246,0.08)" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 2" />
        )}
        {selectedElements.length > 0 && !moveState.current.moving && (
          <SelectionBox elements={selectedElements} zoom={zoom} vpX={vpX} vpY={vpY} />
        )}
      </svg>
      {editingText && <TextEditor id={editingText.id} x={editingText.x} y={editingText.y} width={editingText.w} height={editingText.h} onClose={() => setEditingText(null)} />}
      {editingFormula && <FormulaEditor id={editingFormula.id} onClose={() => setEditingFormula(null)} />}
      {editingGraph && <GraphEditor id={editingGraph.id} onClose={() => setEditingGraph(null)} />}
    </div>
  );
}
