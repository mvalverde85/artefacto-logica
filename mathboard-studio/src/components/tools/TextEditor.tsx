import React, { useRef, useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';

interface Props {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onClose: () => void;
}

export default function TextEditor({ id, x, y, width, height, onClose }: Props) {
  const { board, updateElement, pushHistory } = useBoardStore();
  const el = board.elements.find((e) => e.id === id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) { textareaRef.current.focus(); textareaRef.current.select(); }
  }, []);

  const text = (el as any)?.text ?? '';
  const style = el?.style;

  const handleBlur = () => { pushHistory(); onClose(); };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { updateElement(id, { text: e.target.value } as any); };

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: Math.max(width, 120), minHeight: Math.max(height, 40), zIndex: 1000 }}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        style={{
          width: '100%',
          minHeight: Math.max(height, 40),
          fontSize: style?.fontSize,
          fontFamily: style?.fontFamily,
          color: style?.strokeColor,
          fontWeight: style?.bold ? 'bold' : 'normal',
          fontStyle: style?.italic ? 'italic' : 'normal',
          textDecoration: style?.underline ? 'underline' : 'none',
          background: 'rgba(255,255,255,0.95)',
          border: '2px solid #3b82f6',
          borderRadius: 4,
          padding: 4,
          outline: 'none',
          resize: 'both',
          overflow: 'auto',
        }}
      />
    </div>
  );
}
