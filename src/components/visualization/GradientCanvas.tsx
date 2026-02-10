import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';

export function GradientCanvas() {
  const canvasRef = useCanvasRenderer();

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ imageRendering: 'auto' }}
    />
  );
}
