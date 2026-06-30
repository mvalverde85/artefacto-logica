export type ElementType =
  | 'stroke'
  | 'shape'
  | 'connector'
  | 'line'
  | 'polyline'
  | 'bezierCurve'
  | 'stickyNote'
  | 'text'
  | 'formula'
  | 'graph'
  | 'image'
  | 'group';

export interface Style {
  strokeColor: string;
  strokeWidth: number;
  strokeDash: 'solid' | 'dashed' | 'dotted';
  fillColor: string;
  fillOpacity: number;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  startArrow?: boolean;
  endArrow?: boolean;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  style: Style;
}

export interface StrokeElement extends BaseElement {
  type: 'stroke';
  points: [number, number][];
  smoothed: boolean;
}

export type ShapeKind =
  | 'rect' | 'circle' | 'ellipse' | 'triangle' | 'polygon'
  | 'diamond' | 'parallelogram' | 'trapezoid' | 'arrow'
  | 'star' | 'callout'
  | 'cube' | 'cylinder' | 'cone' | 'pyramid' | 'sphere';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  kind: ShapeKind;
  sides?: number;
  text?: string;
}

export interface LineElement extends BaseElement {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PolylineElement extends BaseElement {
  type: 'polyline';
  points: [number, number][];
  closed: boolean;
}

export interface BezierElement extends BaseElement {
  type: 'bezierCurve';
  points: [number, number][];
  controlPoints: [number, number][];
}

export interface ConnectorElement extends BaseElement {
  type: 'connector';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromElementId?: string;
  toElementId?: string;
  connectorType: 'straight' | 'orthogonal' | 'curved';
  label?: string;
}

export interface StickyNoteElement extends BaseElement {
  type: 'stickyNote';
  text: string;
  color: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
}

export interface FormulaElement extends BaseElement {
  type: 'formula';
  latex: string;
  renderedSvg?: string;
}

export interface FunctionDef {
  id: string;
  expression: string;
  color: string;
  strokeWidth: number;
  visible: boolean;
}

export interface GraphElement extends BaseElement {
  type: 'graph';
  functions: FunctionDef[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  showGrid: boolean;
  showAxes: boolean;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  originalWidth: number;
  originalHeight: number;
}

export interface GroupElement extends BaseElement {
  type: 'group';
  childIds: string[];
}

export type BoardElement =
  | StrokeElement
  | ShapeElement
  | LineElement
  | PolylineElement
  | BezierElement
  | ConnectorElement
  | StickyNoteElement
  | TextElement
  | FormulaElement
  | GraphElement
  | ImageElement
  | GroupElement;
