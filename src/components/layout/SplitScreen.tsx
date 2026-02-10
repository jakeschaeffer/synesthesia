import type { ReactNode } from 'react';

interface SplitScreenProps {
  top: ReactNode;
  bottom: ReactNode;
}

export function SplitScreen({ top, bottom }: SplitScreenProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0e0e18]">
      <div className="h-1/2 min-h-0 relative">
        {top}
      </div>
      <div className="h-1/2 min-h-0 flex flex-col overflow-y-auto border-t border-white/5">
        {bottom}
      </div>
    </div>
  );
}
