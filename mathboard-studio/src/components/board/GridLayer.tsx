import React from 'react';
import type { BackgroundType } from '../../types/board';

interface Props {
  width: number;
  height: number;
  vpX: number;
  vpY: number;
  zoom: number;
  background: BackgroundType;
  gridSize: number;
}

export default function GridLayer({ width, height, vpX, vpY, zoom, background, gridSize }: Props) {
  const scaledGrid = gridSize * zoom;
  const offsetX = ((vpX % scaledGrid) + scaledGrid) % scaledGrid;
  const offsetY = ((vpY % scaledGrid) + scaledGrid) % scaledGrid;

  if (background === 'blank') return <rect width={width} height={height} fill="white" />;
  if (background === 'dark') return <rect width={width} height={height} fill="#1e1e2e" />;
  if (background === 'blackboard') return <rect width={width} height={height} fill="#2d4a3e" />;

  const isDots = background === 'dots';
  const isIso = background === 'isometric';

  if (isDots) {
    const cols = Math.ceil(width / scaledGrid) + 2;
    const rows = Math.ceil(height / scaledGrid) + 2;
    const dots: React.ReactNode[] = [];
    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        dots.push(<circle key={`${r}-${c}`} cx={offsetX + c * scaledGrid} cy={offsetY + r * scaledGrid} r={1.5} fill="#c8d0d8" />);
      }
    }
    return <><rect width={width} height={height} fill="white" />{dots}</>;
  }

  if (isIso) {
    const lines: React.ReactNode[] = [];
    const isoGridSize = scaledGrid * 1.5;
    const diagCount = Math.ceil((width + height) / isoGridSize) * 2;
    for (let i = -diagCount; i < diagCount; i++) {
      const x = offsetX + i * isoGridSize;
      lines.push(
        <line key={`r${i}`} x1={x} y1={0} x2={x + height} y2={height} stroke="#e2e8f0" strokeWidth={0.5} />,
        <line key={`l${i}`} x1={x + height} y1={0} x2={x} y2={height} stroke="#e2e8f0" strokeWidth={0.5} />
      );
    }
    return <><rect width={width} height={height} fill="white" />{lines}</>;
  }

  const strokeColor = '#e2e8f0';
  const cols = Math.ceil(width / scaledGrid) + 2;
  const rows = Math.ceil(height / scaledGrid) + 2;
  const lines: React.ReactNode[] = [];
  for (let r = -1; r < rows; r++) lines.push(<line key={`h${r}`} x1={0} y1={offsetY + r * scaledGrid} x2={width} y2={offsetY + r * scaledGrid} stroke={strokeColor} strokeWidth={0.5} />);
  for (let c = -1; c < cols; c++) lines.push(<line key={`v${c}`} x1={offsetX + c * scaledGrid} y1={0} x2={offsetX + c * scaledGrid} y2={height} stroke={strokeColor} strokeWidth={0.5} />);

  return <><rect width={width} height={height} fill="white" />{lines}</>;
}
