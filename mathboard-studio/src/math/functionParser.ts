import * as math from 'mathjs';

export function evaluateFunction(
  expression: string,
  xMin: number,
  xMax: number,
  steps = 500
): [number, number][] {
  const points: [number, number][] = [];
  const step = (xMax - xMin) / steps;

  let compiled: math.EvalFunction | null = null;
  try {
    compiled = math.compile(expression.replace(/y\s*=\s*/, '').replace(/f\(x\)\s*=\s*/, ''));
  } catch {
    return [];
  }

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * step;
    try {
      const y = compiled.evaluate({ x });
      if (typeof y === 'number' && isFinite(y)) {
        points.push([x, y]);
      } else {
        points.push([NaN, NaN]);
      }
    } catch {
      points.push([NaN, NaN]);
    }
  }
  return points;
}

export function pointsToSvgPath(
  points: [number, number][],
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  width: number, height: number
): string {
  const scaleX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const scaleY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

  let d = '';
  let penDown = false;
  for (const [x, y] of points) {
    if (!isFinite(x) || !isFinite(y)) {
      penDown = false;
      continue;
    }
    const sx = scaleX(x);
    const sy = scaleY(y);
    if (!penDown) {
      d += `M ${sx.toFixed(2)} ${sy.toFixed(2)} `;
      penDown = true;
    } else {
      d += `L ${sx.toFixed(2)} ${sy.toFixed(2)} `;
    }
  }
  return d;
}
