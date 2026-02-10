import { useCallback } from 'react';
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';

export function GradientCanvas() {
  const canvasRef = useCanvasRenderer();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const fraction = x / rect.width;

      const state = useSynesthesiaStore.getState();
      const { text, colorMap, openVariantModal } = state;
      if (text.length === 0) return;

      const charIndex = Math.min(
        Math.floor(fraction * text.length),
        text.length - 1,
      );
      const char = text[charIndex];
      if (/\s/.test(char)) return;

      const key = char.toLowerCase();
      const color = colorMap[key];
      if (!color) return;

      openVariantModal(key, color, {
        x: e.clientX,
        y: e.clientY,
      });
    },
    [],
  );

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block cursor-pointer"
      style={{ imageRendering: 'auto' }}
      onClick={handleClick}
    />
  );
}
