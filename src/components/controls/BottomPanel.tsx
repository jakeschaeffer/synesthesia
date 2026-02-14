import { useState } from 'react';
import { TextInputArea } from '../input/TextInputArea';
import { GradientControls } from './GradientControls';
import { ProfileManager } from '../profile/ProfileManager';
import { ShareColors } from '../profile/ShareColors';

type Tab = 'type' | 'colors';

export function BottomPanel() {
  const [tab, setTab] = useState<Tab>('type');

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tab bar */}
      <div className="flex border-b border-white/5 shrink-0">
        <button
          onClick={() => setTab('type')}
          className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
            tab === 'type'
              ? 'text-white/80 border-b-2 border-white/40'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          Type
        </button>
        <button
          onClick={() => setTab('colors')}
          className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
            tab === 'colors'
              ? 'text-white/80 border-b-2 border-white/40'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          Edit Colors
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
        {tab === 'type' && (
          <>
            <TextInputArea />
            <GradientControls />
          </>
        )}
        {tab === 'colors' && (
          <>
            <ProfileManager />
            <ShareColors />
          </>
        )}
      </div>
    </div>
  );
}
