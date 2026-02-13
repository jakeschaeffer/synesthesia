import { useState } from 'react';
import { SplitScreen } from './components/layout/SplitScreen';
import { GradientCanvas } from './components/visualization/GradientCanvas';
import { TextInputArea } from './components/input/TextInputArea';
import { GradientControls } from './components/controls/GradientControls';
import { ProfileManager } from './components/profile/ProfileManager';
import { ProfileLegendView } from './components/profile/ProfileLegendView';
import { ColorVariantModal } from './components/color-picker/ColorVariantModal';

type EditorTab = 'typing' | 'legend';

export default function App() {
  const [activeTab, setActiveTab] = useState<EditorTab>('typing');

  return (
    <>
      <SplitScreen
        top={<GradientCanvas />}
        bottom={
          <div className="h-full flex flex-col">
            <div className="px-4 pt-3 pb-2 border-b border-white/5">
              <div className="inline-flex rounded-xl bg-white/5 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('typing')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    activeTab === 'typing'
                      ? 'bg-white/14 text-white'
                      : 'text-white/55 hover:text-white/75'
                  }`}
                >
                  Text View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('legend')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    activeTab === 'legend'
                      ? 'bg-white/14 text-white'
                      : 'text-white/55 hover:text-white/75'
                  }`}
                >
                  Profile Legend
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              {activeTab === 'typing' ? (
                <>
                  <TextInputArea />
                  <GradientControls />
                </>
              ) : (
                <ProfileLegendView />
              )}
            </div>

            <ProfileManager onProfileCreated={() => setActiveTab('legend')} />
          </div>
        }
      />
      <ColorVariantModal />
    </>
  );
}
