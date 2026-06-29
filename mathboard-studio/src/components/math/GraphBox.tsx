import React from 'react';
import type { GraphElement } from '../../types/elements';
import { evaluateFunction, pointsToSvgPath } from '../../math/functionParser';

interface Props { element: GraphElement; }

export default function GraphBox({ element }: Props) {
  const { functions, xMin, xMax, yMin, yMax, showGrid, showAxes } = element;
  const width = element.width;
  const height = element.height;

  const scaleX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const scaleY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

  const axisPaths: React.ReactNode[] = [];
  if (showAxes) {
    if (yMin <= 0 && yMax >= 0) axisPaths.push(<line key="x-axis" x1={0} y1={scaleY(0)} x2={width} y2={scaleY(0)} stroke="#374151" strokeWidth={1} />);
    if (xMin <= 0 && xMax >= 0) axisPaths.push(<line key="y-axis" x1={scaleX(0)} y1={0} x2={scaleX(0)} y2={height} stroke="#374151" strokeWidth={1} />);
  }

  const gridLines: React.ReactNode[] = [];
  if (showGrid) {
    const xStep = (xMax - xMin) / 10;
    const yStep = (yMax - yMin) / 10;
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep)
      gridLines.push(<line key={`gv${x}`} x1={scaleX(x)} y1={0} x2={scaleX(x)} y2={height} stroke="#e5e7eb" strokeWidth={0.5} />);
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep)
      gridLines.push(<line key={`gh${y}`} x1={0} y1={scaleY(y)} x2={width} y2={scaleY(y)} stroke="#e5e7eb" strokeWidth={0.5} />);
  }

  const funcPaths = functions.filter((f) => f.visible).map((f) => {
    const pts = evaluateFunction(f.expression, xMin, xMax, 600);
    const d = pointsToSvgPath(pts, xMin, xMax, yMin, yMax, width, height);
    return <path key={f.id} d={d} stroke={f.color} strokeWidth={f.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  });

  const labels: React.ReactNode[] = [];
  for (let i = 0; i <= 5; i++) {
    const x = xMin + (i / 5) * (xMax - xMin);
    labels.push(<text key={`xl${i}`} x={scaleX(x)} y={height - 2} textAnchor="middle" fontSize={9} fill="#6b7280">{x.toFixed(1)}</text>);
    const y = yMin + (i / 5) * (yMax - yMin);
    labels.push(<text key={`yl${i}`} x={2} y={scaleY(y)} dominantBaseline="middle" fontSize={9} fill="#6b7280">{y.toFixed(1)}</text>);
  }

  return (
    <div style={{ width, height, background: 'white', border: '1.5px solid #93c5fd', borderRadius: 6, overflow: 'hidden' }}>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill="white" />
        {gridLines}{axisPaths}{funcPaths}{labels}
      </svg>
    </div>
  );
}
