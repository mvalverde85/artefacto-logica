import type { BoardElement, Style } from '../../types/elements';
import { pointsToSvgPath } from '../../utils/geometry';
import GraphBox from '../math/GraphBox';

interface Props {
  element: BoardElement;
  selected: boolean;
  onDoubleClick?: (id: string) => void;
}

function styleToSvgProps(style: Style) {
  const dashArray = style.strokeDash === 'dashed' ? '8 4' : style.strokeDash === 'dotted' ? '2 4' : undefined;
  return { stroke: style.strokeColor, strokeWidth: style.strokeWidth, strokeDasharray: dashArray, fill: style.fillColor === 'transparent' ? 'none' : style.fillColor, opacity: style.opacity };
}

function ShapeSvg({ element }: { element: Extract<BoardElement, { type: 'shape' }> }) {
  const { x, y, width: w, height: h, kind, style } = element;
  const sp = styleToSvgProps(style);
  switch (kind) {
    case 'rect': return <rect x={x} y={y} width={w} height={h} rx={4} {...sp} />;
    case 'circle': { const r = Math.min(w, h) / 2; return <circle cx={x + w / 2} cy={y + h / 2} r={r} {...sp} />; }
    case 'ellipse': return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...sp} />;
    case 'triangle': return <polygon points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`} {...sp} />;
    case 'diamond': return <polygon points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`} {...sp} />;
    case 'parallelogram': { const sk = w * 0.2; return <polygon points={`${x + sk},${y} ${x + w},${y} ${x + w - sk},${y + h} ${x},${y + h}`} {...sp} />; }
    case 'trapezoid': { const off = w * 0.15; return <polygon points={`${x + off},${y} ${x + w - off},${y} ${x + w},${y + h} ${x},${y + h}`} {...sp} />; }
    case 'star': {
      const cx = x + w / 2, cy = y + h / 2, outerR = Math.min(w, h) / 2, innerR = outerR * 0.4;
      const pts = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2; const r = i % 2 === 0 ? outerR : innerR; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; });
      return <polygon points={pts.join(' ')} {...sp} />;
    }
    case 'cube': { const d = Math.min(w, h) * 0.25; return <g><polygon points={`${x},${y + d} ${x + w - d},${y + d} ${x + w - d},${y + h} ${x},${y + h}`} {...sp} /><polygon points={`${x},${y + d} ${x + d},${y} ${x + w},${y} ${x + w - d},${y + d}`} {...sp} /><polygon points={`${x + w - d},${y + d} ${x + w},${y} ${x + w},${y + h - d} ${x + w - d},${y + h}`} {...sp} /></g>; }
    case 'cylinder': { const rx = w / 2, ry = h * 0.12, cx2 = x + w / 2; return <g><rect x={x} y={y + ry} width={w} height={h - ry * 2} {...sp} /><ellipse cx={cx2} cy={y + ry} rx={rx} ry={ry} {...sp} /><ellipse cx={cx2} cy={y + h - ry} rx={rx} ry={ry} {...sp} /></g>; }
    case 'cone': { const bCx = x + w / 2, ry2 = h * 0.12; return <g><path d={`M ${bCx} ${y} L ${x} ${y + h - ry2} Q ${bCx} ${y + h + ry2} ${x + w} ${y + h - ry2} Z`} {...sp} /><ellipse cx={bCx} cy={y + h - ry2} rx={w / 2} ry={ry2} {...sp} /></g>; }
    case 'pyramid': return <polygon points={`${x + w / 2},${y} ${x},${y + h} ${x + w},${y + h}`} {...sp} />;
    case 'sphere': { const r3 = Math.min(w, h) / 2, cx3 = x + w / 2, cy3 = y + h / 2; return <g><circle cx={cx3} cy={cy3} r={r3} {...sp} /><ellipse cx={cx3} cy={cy3} rx={r3} ry={r3 * 0.3} stroke={style.strokeColor} strokeWidth={style.strokeWidth} fill="none" opacity={0.5} /></g>; }
    default: return <rect x={x} y={y} width={w} height={h} {...sp} />;
  }
}

export default function ElementRenderer({ element, onDoubleClick }: Props) {
  const handleDblClick = () => onDoubleClick?.(element.id);
  if (!element.visible) return null;

  switch (element.type) {
    case 'stroke': {
      const d = pointsToSvgPath(element.points, true);
      return <path d={d} stroke={element.style.strokeColor} strokeWidth={element.style.strokeWidth} fill="none" opacity={element.style.opacity} strokeLinecap="round" strokeLinejoin="round" />;
    }
    case 'shape':
      return (
        <g onDoubleClick={handleDblClick} style={{ cursor: 'move' }}>
          <ShapeSvg element={element} />
          {element.text && <text x={element.x + element.width / 2} y={element.y + element.height / 2} textAnchor="middle" dominantBaseline="middle" fontSize={element.style.fontSize} fill={element.style.strokeColor} style={{ userSelect: 'none', pointerEvents: 'none' }}>{element.text}</text>}
        </g>
      );
    case 'line': {
      const { x1, y1, x2, y2, style } = element;
      const sp = styleToSvgProps(style);
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
      return (
        <g>
          {style.startArrow && <polygon points="0,-4 8,0 0,4" fill={style.strokeColor} transform={`translate(${x1},${y1}) rotate(${angle + 180})`} />}
          <line x1={x1} y1={y1} x2={x2} y2={y2} {...sp} strokeLinecap="round" />
          {style.endArrow && <polygon points="0,-4 8,0 0,4" fill={style.strokeColor} transform={`translate(${x2},${y2}) rotate(${angle})`} />}
        </g>
      );
    }
    case 'polyline': {
      const pts = element.points.map((p) => p.join(',')).join(' ');
      const sp = styleToSvgProps(element.style);
      return element.closed ? <polygon points={pts} {...sp} /> : <polyline points={pts} {...sp} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    }
    case 'connector': {
      const { fromX, fromY, toX, toY, style, connectorType } = element;
      const sp = styleToSvgProps(style);
      let d = '';
      if (connectorType === 'straight') d = `M ${fromX} ${fromY} L ${toX} ${toY}`;
      else if (connectorType === 'curved') { const mx = (fromX + toX) / 2, my = (fromY + toY) / 2 - 40; d = `M ${fromX} ${fromY} Q ${mx} ${my} ${toX} ${toY}`; }
      else { const mx2 = (fromX + toX) / 2; d = `M ${fromX} ${fromY} L ${mx2} ${fromY} L ${mx2} ${toY} L ${toX} ${toY}`; }
      const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
      return (
        <g>
          <path d={d} {...sp} fill="none" strokeLinecap="round" />
          {style.endArrow && <polygon points="0,-4 8,0 0,4" fill={style.strokeColor} transform={`translate(${toX},${toY}) rotate(${angle})`} />}
          {element.label && <text x={(fromX + toX) / 2} y={(fromY + toY) / 2 - 8} textAnchor="middle" fontSize={12} fill={style.strokeColor}>{element.label}</text>}
        </g>
      );
    }
    case 'stickyNote': {
      const { x, y, width: w, height: h, text, color } = element;
      return (
        <foreignObject x={x} y={y} width={w} height={h} onDoubleClick={handleDblClick}>
          <div style={{ width: '100%', height: '100%', background: color, borderRadius: 8, padding: 8, boxShadow: '2px 4px 12px rgba(0,0,0,0.15)', fontSize: element.style.fontSize, fontFamily: element.style.fontFamily, overflow: 'hidden', wordBreak: 'break-word', cursor: 'move', userSelect: 'none' }}>{text}</div>
        </foreignObject>
      );
    }
    case 'text': {
      const { x, y, width: w, height: h, text, style } = element;
      return (
        <foreignObject x={x} y={y} width={w} height={Math.max(h, 30)} onDoubleClick={handleDblClick}>
          <div style={{ width: '100%', height: '100%', fontSize: style.fontSize, fontFamily: style.fontFamily, color: style.strokeColor, fontWeight: style.bold ? 'bold' : 'normal', fontStyle: style.italic ? 'italic' : 'normal', textDecoration: style.underline ? 'underline' : 'none', textAlign: style.textAlign, opacity: style.opacity, whiteSpace: 'pre-wrap', wordBreak: 'break-word', cursor: 'move', userSelect: 'none' }}>{text}</div>
        </foreignObject>
      );
    }
    case 'formula': {
      const { x, y, width: w, height: h, latex } = element;
      return (
        <foreignObject x={x} y={y} width={w} height={h} onDoubleClick={handleDblClick}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'move', userSelect: 'none', padding: 4, background: 'white', borderRadius: 4 }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: element.renderedSvg || `<span style="font-family:serif;font-size:14px">${latex}</span>` }}
          />
        </foreignObject>
      );
    }
    case 'graph': {
      const { x, y, width: w, height: h } = element;
      return (
        <foreignObject x={x} y={y} width={w} height={h} onDoubleClick={handleDblClick}>
          <GraphBox element={element} />
        </foreignObject>
      );
    }
    case 'image': {
      const { x, y, width: w, height: h, src } = element;
      return <image href={src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" opacity={element.style.opacity} />;
    }
    default: return null;
  }
}
