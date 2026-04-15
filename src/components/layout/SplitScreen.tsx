import type { ReactNode } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';

interface SplitScreenProps {
  top: ReactNode;
  bottom: ReactNode;
}

export function SplitScreen({ top, bottom }: SplitScreenProps) {
  const hasText = useSynesthesiaStore((s) => s.text.length > 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0e0e18]">
      <div
        className="min-h-0 relative transition-all duration-500 ease-out"
        style={{ flex: hasText ? '1 1 50%' : '0 0 0px' }}
      >
        {top}
      </div>
      <div
        className="min-h-0 flex flex-col overflow-hidden border-t border-white/5 transition-all duration-500 ease-out"
        style={{ flex: hasText ? '1 1 50%' : '1 1 100%' }}
      >
        {bottom}
      </div>
    </div>
  );
}
