import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';

interface SplitScreenProps {
  top: ReactNode;
  bottom: ReactNode;
}

const MIN_TOP_PERCENT = 0;
const MAX_TOP_PERCENT = 50;
const DEFAULT_TOP_PERCENT = 50;

export function SplitScreen({ top, bottom }: SplitScreenProps) {
  const hasText = useSynesthesiaStore((s) => s.text.length > 0);
  const [topPercent, setTopPercent] = useState(DEFAULT_TOP_PERCENT);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientY - rect.top) / rect.height) * 100;
      setTopPercent(Math.min(MAX_TOP_PERCENT, Math.max(MIN_TOP_PERCENT, percent)));
    },
    [dragging],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#0e0e18]"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className={`min-h-0 relative ${dragging ? '' : 'transition-all duration-500 ease-out'}`}
        style={{ flex: hasText ? `0 0 ${topPercent}%` : '0 0 0px' }}
      >
        {top}
      </div>

      {/* Drag handle */}
      {hasText && (
        <div
          onPointerDown={handlePointerDown}
          className={`h-1.5 shrink-0 cursor-row-resize flex items-center justify-center group ${
            dragging ? 'bg-white/10' : 'hover:bg-white/8'
          } transition-colors`}
        >
          <div className={`w-10 h-0.5 rounded-full transition-colors ${
            dragging ? 'bg-white/40' : 'bg-white/15 group-hover:bg-white/30'
          }`} />
        </div>
      )}

      <div
        className={`min-h-0 flex flex-col overflow-hidden border-t border-white/5 ${
          dragging ? '' : 'transition-all duration-500 ease-out'
        }`}
        style={{ flex: '1 1 0%' }}
      >
        {bottom}
      </div>
    </div>
  );
}
