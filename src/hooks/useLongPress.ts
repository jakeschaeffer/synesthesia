import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  threshold?: number;
  onLongPress: (e: React.PointerEvent) => void;
}

export function useLongPress({ threshold = 400, onLongPress }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      triggeredRef.current = false;
      clear();
      timerRef.current = setTimeout(() => {
        triggeredRef.current = true;
        onLongPress(e);
      }, threshold);
    },
    [threshold, onLongPress, clear],
  );

  const onPointerUp = useCallback(() => {
    clear();
  }, [clear]);

  const onPointerLeave = useCallback(() => {
    clear();
  }, [clear]);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    // Prevent context menu on long-press (especially mobile)
    if (triggeredRef.current) {
      e.preventDefault();
    }
  }, []);

  return { onPointerDown, onPointerUp, onPointerLeave, onContextMenu };
}
