export function screenToCanvas(
  sx: number, sy: number,
  vpX: number, vpY: number, zoom: number
): [number, number] {
  return [(sx - vpX) / zoom, (sy - vpY) / zoom];
}

export function canvasToScreen(
  cx: number, cy: number,
  vpX: number, vpY: number, zoom: number
): [number, number] {
  return [cx * zoom + vpX, cy * zoom + vpY];
}

export function snapToGrid(value: number, gridSize: number, snap: boolean): number {
  if (!snap) return value;
  return Math.round(value / gridSize) * gridSize;
}

export function getBoundingBox(points: [number, number][]): {
  x: number; y: number; width: number; height: number;
} {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function pointInRect(
  px: number, py: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function smoothPoints(points: [number, number][], factor = 0.5): [number, number][] {
  if (points.length < 3) return points;
  const smoothed: [number, number][] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    smoothed.push([
      curr[0] * (1 - factor) + ((prev[0] + next[0]) / 2) * factor,
      curr[1] * (1 - factor) + ((prev[1] + next[1]) / 2) * factor,
    ]);
  }
  smoothed.push(points[points.length - 1]);
  return smoothed;
}

export function pointsToSvgPath(points: [number, number][], smooth = true): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  const pts = smooth ? smoothPoints(points) : points;
  if (!smooth || pts.length < 3) {
    return `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map((p) => `L ${p[0]} ${p[1]}`).join(' ');
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0]} ${pts[i][1]} ${mx} ${my}`;
  }
  d += ` L ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
  return d;
}
