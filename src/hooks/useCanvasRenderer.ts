import { useEffect, useRef, useCallback } from 'react';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import { computeGradientStops } from '../utils/gradientCalculation';
import { renderGradient } from '../components/visualization/CanvasRenderer';

export function useCanvasRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = useSynesthesiaStore.getState();
    const stops = computeGradientStops(
      state.text,
      state.colorMap,
      state.gradientSettings,
    );

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    renderGradient(ctx, rect.width, rect.height, stops);
  }, []);

  const scheduleDraw = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    }, 16);
  }, [draw]);

  useEffect(() => {
    // Track previous values to only redraw when canvas-relevant state changes
    let prev = useSynesthesiaStore.getState();
    const unsubscribe = useSynesthesiaStore.subscribe((state) => {
      if (
        state.text !== prev.text ||
        state.colorMap !== prev.colorMap ||
        state.gradientSettings !== prev.gradientSettings
      ) {
        scheduleDraw();
      }
      prev = state;
    });

    // Initial draw
    draw();

    // Resize observer
    const canvas = canvasRef.current;
    if (!canvas) return unsubscribe;

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    });
    resizeObserver.observe(canvas);

    return () => {
      unsubscribe();
      resizeObserver.disconnect();
      cancelAnimationFrame(rafRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [draw, scheduleDraw]);

  return canvasRef;
}
