import type { Board } from '../types/board';

export function exportJson(board: Board): void {
  const json = JSON.stringify(board, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${board.title}.json`);
}

export function exportPng(svgEl: SVGSVGElement, title: string): void {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const img = new Image();
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svgEl.clientWidth * 2;
    canvas.height = svgEl.clientHeight * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((b) => {
      if (b) downloadBlob(b, `${title}.png`);
      URL.revokeObjectURL(url);
    });
  };
  img.src = url;
}

export function exportSvg(svgEl: SVGSVGElement, title: string): void {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  downloadBlob(blob, `${title}.svg`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
